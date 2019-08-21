import { RootState } from "./store";
import { takeLeading, put } from "redux-saga/effects";
import BigNumber from "bignumber.js";
import { web3, kit } from "./root";
import { Contact } from "expo-contacts";
import { Dictionary } from "lodash";
import { fetchContacts, PhoneNumberMappingEntry } from "@celo/dappkit";

export interface State {
  address: string | undefined;
  stableBalance: string;
  goldBalance: string;
  rawContacts: { [id: string]: Contact };
  addressMapping: Dictionary<PhoneNumberMappingEntry>;
}

const INITIAL_STATE = {
  address: undefined,
  stableBalance: "0",
  goldBalance: "0",
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
        stableBalance: action.stableBalance.toString(),
        goldBalance: action.goldBalance.toString()
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
  const stableToken = await kit.contracts.getStableToken()
  const goldToken = await kit.contracts.getGoldToken()
  return Promise.all([
    stableToken.balanceOf(address),
    goldToken.balanceOf(address)
  ]);
}

export function prettyBalance(number: string) {
  return new BigNumber(number).div("1000000000000000000").decimalPlaces(2, BigNumber.ROUND_DOWN)
}

export function* refreshBalancesSaga(action: SetAccount | RefreshBalances) {
  const [stableBalance, goldBalance] = yield getBalances(action.address);
  yield put(setBalance(stableBalance, goldBalance));
}

export function* fetchContactsSaga(action: GetContacts) {
  const {rawContacts, phoneNumbersByAddress} = yield fetchContacts(web3);
  yield put(setAddressMapping(rawContacts, phoneNumbersByAddress))
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
