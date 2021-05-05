import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import authReducer from './authReducer';
import configReducer from './configReducer';
import marketsReducer from './marketsReducer';

export default combineReducers({
  authentication: authReducer,
  config: configReducer,
  fetched: marketsReducer,
  form: formReducer
});
