import { produce } from 'immer';

import { SET_TOKEN } from './constants';

const defaultState = {
  token: null,
};

const handleSetToken = (newState, payload) => {
  newState.token = payload.token;
  return newState;
};


const reducer = (state=defaultState, action) => {
  switch(action.type) {
    case SET_TOKEN:
      return produce(state, draft => handleSetToken(draft, action.payload));
    default:
      return state;
  }
};

export default reducer;