import { takeLeading, put, select } from "redux-saga/effects";
import { SetAccount, actions as AccountActions, getAccount } from "./account";
import SavingsCircle from "./web3-contracts/SavingsCircle";
import { SavingsCircle as SavingsCircleType } from "./web3-types/SavingsCircle";
import { web3 } from "./root";
import BigNumber from "bignumber.js";
import { StableToken } from "@celo/contractkit";
import { requestTxSignature } from "./dappkit";

const INITIAL_STATE = {
  circles: []
};

export enum actions {
  FETCHED_CIRCLES = "SAVINGSCIRCLES/FETCHED_CIRCLES",
  ADD_CIRCLE = "SAVINGSCIRCLES/ADD_CIRCLE",
  SEND_ADD_CIRCLE_TX = "SAVINGSCIRCLES/SEND_ADD_CIRCLE_TX"
}

export type FetchedCircles = { type: actions.FETCHED_CIRCLES, circles: CircleInfo[] }
export type AddCircle = { type: actions.ADD_CIRCLE, name: string, members: string[] }
export type SendAddCircleTx = { type: actions.ADD_CIRCLE, rawTx: string }
export const addCircle = (name: string, members: string[]) => ({ type: actions.ADD_CIRCLE, name, members })
export const sendAddCircleTx = (rawTx: string) => ({ type: actions.SEND_ADD_CIRCLE_TX, rawTx })

export type ActionTypes = FetchedCircles | AddCircle | SendAddCircleTx

export interface State {
  circles: CircleInfo[]
}

export const reducer = (
  state: State | undefined = INITIAL_STATE,
  action: ActionTypes
): State => {
  switch (action.type) {
    case actions.FETCHED_CIRCLES:
      return { ...state, circles: action.circles }
    default:
      return state;
  }
};

type RawCircleInfo = {
  0: string;
  1: (string)[];
  2: string;
  3: BN;
  4: BN;
};

export type CircleInfo = {
  name: string;
  members: string[];
  tokenAddress: string;
  depositAmount: BigNumber;
  timestamp: number;
};

function deserializeCircleInfo(rawCircleinfo: RawCircleInfo): CircleInfo {
  return {
    name: rawCircleinfo[0],
    members: rawCircleinfo[1],
    tokenAddress: rawCircleinfo[2],
    depositAmount: new BigNumber(rawCircleinfo[3].toString()),
    timestamp: parseInt(rawCircleinfo[4].toString(), 10)
  };
}

export async function getSavingsCircles(address: string) {
  const contract = await SavingsCircle(web3, address);
  const circleHashes = await contract.methods.circlesFor(address).call();

  const circles = await Promise.all(
    circleHashes.map(circleHash =>
      contract.methods.circleInfo(circleHash).call().then(deserializeCircleInfo)
    )
  );

  return circles
}

export function* fetchSavingsCircles(action: SetAccount) {
  const circles = yield getSavingsCircles(action.address)
  yield put({ type: actions.FETCHED_CIRCLES, circles })
}

async function makeAddCircleTx(address: string, name: string, members: string[]) {
  const contract = await SavingsCircle(web3, address);
  const stableToken = await StableToken(web3, address)
  const depositAmount = web3.utils.toWei('1', 'ether').toString()
  const tx = await contract.methods.addCircle(name, members, stableToken._address, depositAmount)
  const estimatedGas = await tx.estimateGas()

  const nonce = await web3.eth.getTransactionCount(address)
  console.log('Got tx:', tx.encodeABI(), estimatedGas, nonce)
  // @ts-ignore
  requestTxSignature(tx.encodeABI({ nonce }), estimatedGas, address, contract._address, nonce, "/home/test")
  return tx
}

export function* makeAddCircleTxSaga(action: AddCircle) {
  console.log("Make Add Circle TX")

  const address = yield select(getAccount)

  yield makeAddCircleTx(address, action.name, action.members)
}

async function sendTx(tx: string) {
  return new Promise((resolve, reject) => {
    web3.eth.sendSignedTransaction(tx).on('confirmation', resolve).on('error', reject).catch(reject)
  })
}

export function* sendAddCircleTxSaga(action: SendAddCircleTx) {
  console.log('got signed ex', action.rawTx)

  yield sendTx(action.rawTx)

  const address = yield select(getAccount)
  const circles = yield getSavingsCircles(address)
  yield put({ type: actions.FETCHED_CIRCLES, circles })
}

export function* saga() {
  yield takeLeading(AccountActions.SET_ACCOUNT, fetchSavingsCircles);
  yield takeLeading(actions.ADD_CIRCLE, makeAddCircleTxSaga)
  yield takeLeading(actions.SEND_ADD_CIRCLE_TX, sendAddCircleTxSaga)
}
