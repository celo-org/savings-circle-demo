import { AsyncStorage } from "react-native";
import {
  AnyAction,
  applyMiddleware,
  combineReducers,
  createStore,
  Store
} from "redux";
import { persistReducer, persistStore } from "redux-persist";
import createSagaMiddleware from "redux-saga";
import { spawn } from "redux-saga/effects";
import {
  reducer as accountReducer,
  saga as accountSaga,
  State as AccountState
} from "./account";
import {
  reducer as savingsCircleReducer,
  saga as savingsCircleSaga,
  State as SavingsCircleState
} from "./savingscircle";

const persistConfig: any = {
  key: "root",
  version: 0, // default is -1, increment as we make migrations
  storage: AsyncStorage
};

const sagaMiddleware = createSagaMiddleware();

const reducer = combineReducers({
  account: accountReducer,
  savingsCircle: savingsCircleReducer
});

const persistedReducer = persistReducer(persistConfig, reducer);

export function* rootSaga() {
  yield spawn(accountSaga);
  yield spawn(savingsCircleSaga);
}

const store: Store<RootState, AnyAction> = createStore(
  persistedReducer,
  {},
  applyMiddleware(sagaMiddleware)
);

persistStore(store);

sagaMiddleware.run(rootSaga);

export type RootState = {
  account: AccountState;
  savingsCircle: SavingsCircleState;
};

export default store;
