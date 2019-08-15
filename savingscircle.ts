import { takeLeading, put, select } from "redux-saga/effects";
import { SetAccount, actions as AccountActions, getAccount, refreshBalances } from "./account";
import SavingsCircle from "./web3-contracts/SavingsCircle";
import { SavingsCircle as SavingsCircleType } from "./web3-types/SavingsCircle";
import { web3 } from "./root";
import BigNumber from "bignumber.js";
import { StableToken, parseFromContractDecimals } from "@celo/contractkit";
import { requestTxSig, GasCurrency, waitForSignedTxs } from "@celo/dappkit";
import { Linking } from "expo";
import { zipObject } from "lodash";

const INITIAL_STATE = {
  circles: []
};

export enum actions {
  FETCHED_CIRCLES = "SAVINGSCIRCLES/FETCHED_CIRCLES",
  ADD_CIRCLE = "SAVINGSCIRCLES/ADD_CIRCLE",
  SEND_ADD_CIRCLE_TX = "SAVINGSCIRCLES/SEND_ADD_CIRCLE_TX",
  CONTRIBUTE_TO_CIRCLE = "SAVINGSCIRCLES/CONTRIBUTE_TO_CIRCLE",
  WITHDRAW_FROM_CIRCLE = "SAVINGSCIRCLES/WITHDRAW_FROM_CIRCLE"
}

export type FetchedCircles = {
  type: actions.FETCHED_CIRCLES;
  circles: CircleInfo[];
};
export type AddCircle = {
  type: actions.ADD_CIRCLE;
  name: string;
  members: string[];
};
export type SendAddCircleTx = {
  type: actions.SEND_ADD_CIRCLE_TX;
  rawTxs: string[];
};

export type ContributeToCircle = {
  type: actions.CONTRIBUTE_TO_CIRCLE;
  amount: BigNumber;
  circleHash: string;
};

export type WithdrawFromCircle = {
  type: actions.WITHDRAW_FROM_CIRCLE,
  circleHash: string
}


export const addCircle = (name: string, members: string[]) => ({
  type: actions.ADD_CIRCLE,
  name,
  members
});
export const sendAddCircleTx = (rawTxs: string[]) => ({
  type: actions.SEND_ADD_CIRCLE_TX,
  rawTxs
});

export const contributeToCircle = (amount: BigNumber, circleHash: string) => ({
  type: actions.CONTRIBUTE_TO_CIRCLE,
  amount,
  circleHash
});


export const withdrawFromCircle = (circleHash: string) => ({
  type: actions.WITHDRAW_FROM_CIRCLE,
  circleHash
});


export type ActionTypes =
  | FetchedCircles
  | AddCircle
  | SendAddCircleTx
  | ContributeToCircle
  | WithdrawFromCircle;

export interface State {
  circles: CircleInfo[];
}

export const reducer = (
  state: State | undefined = INITIAL_STATE,
  action: ActionTypes
): State => {
  switch (action.type) {
    case actions.FETCHED_CIRCLES:
      return { ...state, circles: action.circles };
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
  members: { [address: string]: BigNumber };
  tokenAddress: string;
  depositAmount: BigNumber;
  prettyDepositAmount: BigNumber;
  timestamp: number;
  circleHash: string;
  withdrawable: boolean;
};

async function deserializeCircleInfo(
  rawCircleinfo: RawCircleInfo,
  balances: {
    0: string[];
    1: BN[];
  },
  circleHash: string,
  withdrawable: boolean
): Promise<CircleInfo> {
  const contract = await StableToken(web3);
  const depositAmount = new BigNumber(rawCircleinfo[3].toString());

  return {
    name: rawCircleinfo[0],
    members: zipObject(
      balances[0].map(a => a.toLowerCase()),
      balances[1].map(n => new BigNumber(n.toString()))
    ),
    tokenAddress: rawCircleinfo[2],
    depositAmount,
    prettyDepositAmount: await parseFromContractDecimals(
      depositAmount,
      contract
    ),
    timestamp: parseInt(rawCircleinfo[4].toString(), 10),
    circleHash,
    withdrawable
  };
}

async function fetchSavingsCircleInfo(
  contract: SavingsCircleType,
  circleHash: string
) {
  const balances = await contract.methods.balancesForCircle(circleHash).call();

  const circleInfo = await contract.methods.circleInfo(circleHash).call();

  const withdrawable = await contract.methods.withdrawable(circleHash).call()

  return deserializeCircleInfo(circleInfo, balances, circleHash, withdrawable);
}

export async function getSavingsCircles(address: string) {
  const contract = await SavingsCircle(web3, address);
  const circleHashes = await contract.methods.circlesFor(address).call();

  const circles = await Promise.all(
    circleHashes.map(circleHash => fetchSavingsCircleInfo(contract, circleHash))
  );

  return circles;
}

export function* fetchSavingsCircles(action: SetAccount) {
  const circles = yield getSavingsCircles(action.address);
  yield put({ type: actions.FETCHED_CIRCLES, circles });
}

async function makeAddCircleTx(
  address: string,
  name: string,
  members: string[]
) {
  const contract = await SavingsCircle(web3, address);
  const stableToken = await StableToken(web3, address);
  const depositAmount = web3.utils.toWei("1", "ether").toString();
  const tx = await contract.methods.addCircle(
    name,
    members,
    stableToken._address,
    depositAmount
  );

  requestTxSig(
    web3,
    // @ts-ignore
    [
      {
        from: address,
        // @ts-ignore
        to: contract.options.address,
        gasCurrency: GasCurrency.cUSD,
        tx: tx
      }
    ],
    {
      callback: Linking.makeUrl("/home/test"),
      requestId: "test",
      dappName: "My Dapps"
    }
  );

  return tx;
}

export function* makeAddCircleTxSaga(action: AddCircle) {
  const address = yield select(getAccount);
  yield makeAddCircleTx(address, action.name, action.members);
}

async function sendTx(tx: string) {
  return new Promise((resolve, reject) => {
    web3.eth
      .sendSignedTransaction(tx)
      .on("confirmation", resolve)
      .on("error", reject)
      .catch(reject);
  });
}

export function* sendAddCircleTxSaga(action: SendAddCircleTx) {
  // @ts-ignore
  yield Promise.all(action.rawTxs.map(sendTx));

  const address = yield select(getAccount);
  const circles = yield getSavingsCircles(address);
  yield put({ type: actions.FETCHED_CIRCLES, circles });
}

async function makeContributeToCircleTx(
  address: string,
  amount: BigNumber,
  circleHash: string
) {
  const contract = await SavingsCircle(web3, address);
  const stableToken = await StableToken(web3, address);
  const approveTx = await stableToken.methods.approve(
    // @ts-ignore
    contract.options.address,
    amount.toString()
  );
  const tx = await contract.methods.contribute(circleHash, amount.toString());

  requestTxSig(
    web3,
    // @ts-ignore
    [
      {
        from: address,
        to: stableToken.options.address,
        gasCurrency: GasCurrency.cUSD,
        tx: approveTx
      },
      {
        from: address,
        // @ts-ignore
        to: contract.options.address,
        gasCurrency: GasCurrency.cUSD,
        // @ts-ignore
        tx: tx,
        estimatedGas: 100000
      }
    ],
    {
      callback: Linking.makeUrl("/home/test"),
      requestId: "test",
      dappName: "My Dapps"
    }
  );

  return tx;
}

export function* contributeToCircleSaga(action: ContributeToCircle) {
  const address = yield select(getAccount);
  yield makeContributeToCircleTx(address, action.amount, action.circleHash);

  const dappKitResponse = yield waitForSignedTxs()
  yield Promise.all(dappKitResponse.rawTxs.map(sendTx));

  const circles = yield getSavingsCircles(address);
  yield put({ type: actions.FETCHED_CIRCLES, circles });
}

async function makeWithdrawFromCircleTx(
  address: string,
  circleHash: string,
) {
  const contract = await SavingsCircle(web3, address);
  const stableToken = await StableToken(web3, address);
  const tx = await contract.methods.withdraw(
    circleHash
  );

  requestTxSig(
    web3,
    // @ts-ignore
    [
      {
        from: address,
        // @ts-ignore
        to: contract.options.address,
        gasCurrency: GasCurrency.cUSD,
        tx: tx
      }
    ],
    {
      callback: Linking.makeUrl("/home/test"),
      requestId: "test",
      dappName: "My Dapps"
    }
  );

  return tx;
}

export function* withdrawFromCircleSaga(action: WithdrawFromCircle) {
  console.log("Make Add Circle T");

  const address = yield select(getAccount);
  yield makeWithdrawFromCircleTx(address, action.circleHash);

  const dappKitResponse = yield waitForSignedTxs()
  yield Promise.all(dappKitResponse.rawTxs.map(sendTx));

  const circles = yield getSavingsCircles(address);
  yield put({ type: actions.FETCHED_CIRCLES, circles });
  yield put(refreshBalances(address))
}

export function* saga() {
  yield takeLeading(AccountActions.SET_ACCOUNT, fetchSavingsCircles);
  yield takeLeading(actions.ADD_CIRCLE, makeAddCircleTxSaga);
  yield takeLeading(actions.SEND_ADD_CIRCLE_TX, sendAddCircleTxSaga);
  yield takeLeading(actions.CONTRIBUTE_TO_CIRCLE, contributeToCircleSaga);
  yield takeLeading(actions.WITHDRAW_FROM_CIRCLE, withdrawFromCircleSaga)
}
