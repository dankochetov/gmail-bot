import { applyMiddleware, combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import { reducer as authReducer } from './reducers/AuthReducer';

const reducer = combineReducers({
    auth: authReducer,
});

const composeEnhancers = composeWithDevTools({});

const store = createStore(reducer, composeEnhancers(applyMiddleware()));

export type RootState = ReturnType<typeof reducer>;

export default store;
