import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import rootReducer from './reducers'
import { ITEM_DRAG } from './actions';

const loggerMiddleware = createLogger({
  predicate: (getState, action) => action.type !== ITEM_DRAG,
  collapsed: true,
  diff: true
});

export default function configureStore(preloadedState) {
  return createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware
    )
  )
}