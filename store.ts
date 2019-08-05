import {
  createStore,
  combineReducers,
  Store,
  AnyAction,
  applyMiddleware
} from "redux";
import { createMigrate, persistReducer, persistStore } from 'redux-persist'
import { reducer as accountReducer, State as AccountState, saga as accountSaga } from "./account";
import { reducer as savingsCircleReducer, State as SavingsCircleState, saga as savingsCircleSaga } from "./savingscircle";
import storage from 'redux-persist/lib/storage'
import createSagaMiddleware from "redux-saga";
import { spawn } from "redux-saga/effects";
import Web3 from "web3";


const persistConfig: any = {
    key: 'root',
    version: 0, // default is -1, increment as we make migrations
    storage,
  }

const sagaMiddleware = createSagaMiddleware();

const reducer = combineReducers({
  account: accountReducer,
  savingsCircle: savingsCircleReducer
});

const persistedReducer = persistReducer(persistConfig, reducer)

export function* rootSaga() {
  yield spawn(accountSaga)
  yield spawn(savingsCircleSaga)
}

const store: Store<RootState, AnyAction> = createStore(
  persistedReducer,
  {},
  applyMiddleware(sagaMiddleware)
);

persistStore(store)

sagaMiddleware.run(rootSaga);


export type RootState = {
  account: AccountState;
  savingsCircle: SavingsCircleState
};

export default store;
