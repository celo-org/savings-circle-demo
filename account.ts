import { RootState } from "./store";
import { takeLeading, put } from "redux-saga/effects";
import {
  GoldToken,
  StableToken,
  getErc20Balance,
} from "@celo/contractkit";
import BigNumber from "bignumber.js";
import { web3 } from "./root";
import { Contact } from "expo-contacts";
import { Dictionary } from "lodash";
import { fetchContacts, PhoneNumberMappingEntry } from "@celo/dappkit";

export interface State {
  address: string | undefined;
  stableBalance: BigNumber;
  goldBalance: BigNumber;
  rawContacts: { [id: string]: Contact };
  addressMapping: Dictionary<PhoneNumberMappingEntry>;
}

const INITIAL_STATE = {
  address: undefined,
  stableBalance: new BigNumber(0),
  goldBalance: new BigNumber(0),
  rawContacts: {},
  addressMapping: {}
};

export enum actions {
  SET_ACCOUNT = "ACCOUNT/SET_ACCOUNT",
  SET_BALANCE = "ACCOUNT/SET_BALANCE",
  LOGOUT = "ACCOUNT/LOGOUT",
  REFRESH_BALANCES = "ACCOUNT/REFRESH_BALANCES",
  GET_CONTACTS = "ACCOUNT/GET_CONTACTS",
  SET_ADDRESS_MAPPING = "ACCOUNT/SET_ADDRESS_MAPPING"
}

export interface SetAccount {
  type: actions.SET_ACCOUNT;
  address: string;
}

export interface SetBalance {
  type: actions.SET_BALANCE;
  stableBalance: BigNumber;
  goldBalance: BigNumber;
}

export interface Logout {
  type: actions.LOGOUT;
}

export interface RefreshBalances {
  type: actions.REFRESH_BALANCES;
  address: string;
}

export interface GetContacts {
  type: actions.GET_CONTACTS;
}

export interface SetAddressMapping {
  type: actions.SET_ADDRESS_MAPPING;
  rawContacts: { [id: string]: Contact };
  addressMapping: Dictionary<PhoneNumberMappingEntry>;
}

export const setAccount = (address: string): SetAccount => ({
  type: actions.SET_ACCOUNT,
  address
});

export const setBalance = (
  stableBalance: BigNumber,
  goldBalance: BigNumber
): SetBalance => ({
  type: actions.SET_BALANCE,
  stableBalance,
  goldBalance
});

export const logout = () => ({ type: actions.LOGOUT });
export const refreshBalances = (address: string) => ({
  type: actions.REFRESH_BALANCES,
  address
});
export const getContacts = () => ({ type: actions.GET_CONTACTS });
export const setAddressMapping = (
  rawContacts: { [id: string]: Contact },
  addressMapping: {
    address: string;
    phoneNumber: string;
    id: string;
    attestationStat: {
      total: number;
      completed: number;
    };
  }[]
) => ({
  type: actions.SET_ADDRESS_MAPPING,
  addressMapping,
  rawContacts
});
export type ActionTypes =
  | SetAccount
  | SetBalance
  | Logout
  | RefreshBalances
  | GetContacts
  | SetAddressMapping;

export const reducer = (
  state: State | undefined = INITIAL_STATE,
  action: ActionTypes
): State => {
  switch (action.type) {
    case actions.SET_ACCOUNT:
      return { ...state, address: action.address };
    case actions.SET_BALANCE:
      return {
        ...state,
        stableBalance: action.stableBalance,
        goldBalance: action.goldBalance
      };
    case actions.LOGOUT:
      return INITIAL_STATE;
    case actions.SET_ADDRESS_MAPPING:
      return {
        ...state,
        rawContacts: action.rawContacts,
        addressMapping: action.addressMapping
      }
    default:
      return state;
  }
};

async function getBalances(address: string) {
  const stableToken = await StableToken(web3);
  const goldToken = await GoldToken(web3);
  return Promise.all([
    getErc20Balance(stableToken, address, web3),
    getErc20Balance(goldToken, address, web3)
  ]);
}

export function* refreshBalancesSaga(action: SetAccount | RefreshBalances) {
  const [stableBalance, goldBalance] = yield getBalances(action.address);
  yield put(setBalance(stableBalance, goldBalance));
}

export function* fetchContactsSaga(action: GetContacts) {
  const [rawContacts, phoneNumbersWithAddresses] = yield fetchContacts(web3);

  yield put(setAddressMapping(rawContacts, phoneNumbersWithAddresses))
}

export function* saga() {
  yield takeLeading(actions.SET_ACCOUNT, refreshBalancesSaga);
  yield takeLeading(actions.REFRESH_BALANCES, refreshBalancesSaga);
  yield takeLeading(actions.GET_CONTACTS, fetchContactsSaga);
}

// Selectors
export const hasAccount = (state: RootState) => {
  return state.account.address !== undefined;
};

export const getAccount = (state: RootState) => {
  return state.account.address;
};
