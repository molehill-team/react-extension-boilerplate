import { createStore, applyMiddleware, combineReducers, compose } from 'redux';

import { DEBUG } from '../shared/resources';
import authReducer from './auth/reducer';


const loggingMiddleware = () => next => action => {
  if (DEBUG) {
    console.info('[Molehill.ext] applying action', action);
  }
  next(action);
};

const store = createStore(
  combineReducers({
    auth: authReducer,
  }),
  compose(
    applyMiddleware(loggingMiddleware),
  ),
);

export default store;