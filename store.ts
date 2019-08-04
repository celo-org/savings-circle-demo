import {
  createStore,
  combineReducers,
  Store,
  AnyAction,
  applyMiddleware
} from "redux";
import { reducer as accountReducer, State as AccountState, saga as accountSaga } from "./account";
import createSagaMiddleware from "redux-saga";
import { spawn } from "redux-saga/effects";
const sagaMiddleware = createSagaMiddleware();

const reducer = combineReducers({
  account: accountReducer
});

export function* rootSaga() {
  yield spawn(accountSaga)
}

const store: Store<RootState, AnyAction> = createStore(
  reducer,
  {},
  applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(rootSaga);

export type RootState = {
  account: AccountState;
};

export default store;
