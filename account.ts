import { RootState } from "./store";
import { takeLeading, put } from "redux-saga/effects";
import Web3 from "web3";
import { GoldToken, StableToken, getErc20Balance } from "@celo/contractkit";
import BigNumber from "bignumber.js";

const INITIAL_STATE = {
  address: undefined,
  stableBalance: new BigNumber(0),
  goldBalance: new BigNumber(0)
};

export enum actions {
  SET_ACCOUNT = "ACCOUNT/SET_ACCOUNT",
  SET_BALANCE = "ACCOUNT/SET_BALANCE"
}

export interface SetAccount {
  type: actions.SET_ACCOUNT;
  address: string;
}

export interface SetBalance {
  type: actions.SET_BALANCE,
  stableBalance: BigNumber,
  goldBalance: BigNumber
}

export const setAccount = (address: string): SetAccount => ({
  type: actions.SET_ACCOUNT,
  address
});

export const setBalance = (stableBalance: BigNumber, goldBalance: BigNumber): SetBalance => ({
  type: actions.SET_BALANCE,
  stableBalance,
  goldBalance
})

export type ActionTypes = SetAccount | SetBalance;

export interface State {
  address: string | undefined;
  stableBalance: BigNumber,
  goldBalance: BigNumber
}

export const reducer = (
  state: State | undefined = INITIAL_STATE,
  action: ActionTypes
): State => {
  switch (action.type) {
    case actions.SET_ACCOUNT:
      return { ...state, address: action.address };
    case actions.SET_BALANCE:
      return { ...state, stableBalance: action.stableBalance, goldBalance: action.goldBalance }
    default:
      return state;
  }
};

async function getBalances(address: string) {
  const web3 = new Web3("https://alfajores-infura.celo-testnet.org");
  const stableToken = await StableToken(web3);
  const goldToken = await GoldToken(web3);
  return Promise.all([
    getErc20Balance(stableToken, address, web3),
    getErc20Balance(goldToken, address, web3)
  ]);
}

export function* accountSet(action: SetAccount) {
  console.log("Fetch Balances for", action.address);

  const [stableBalance, goldBalance] = yield getBalances(action.address)
  console.log(stableBalance, goldBalance)
  yield put(setBalance(stableBalance, goldBalance))
}

export function* saga() {
  yield takeLeading(actions.SET_ACCOUNT, accountSet);
}

// Selectors
export const hasAccount = (state: RootState) => {
  return state.account.address !== undefined;
};
