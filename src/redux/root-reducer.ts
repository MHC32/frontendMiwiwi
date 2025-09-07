import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// slices

import chatReducer from './slices/chat';
import productReducer from './slices/product';
import calendarReducer from './slices/calendar';
import authReducer from './slices/auth.slice';
import companyReducer from './slices/companySlice';
import storeReducer from './slices/store.slice';
import employeeReducer from './slices/employee.slice'
import categoryReducer from './slices/category';
// ----------------------------------------------------------------------

export const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['auth'],
};

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['isAuthenticated', 'user', 'profile'],
};


const productPersistConfig = {
  key: 'product',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['checkout'],
};



export const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer), 
  chat: chatReducer,
  calendar: calendarReducer,
  product: persistReducer(productPersistConfig, productReducer),
  company: companyReducer,
  store: storeReducer,
  employee: employeeReducer,
  category: categoryReducer,
});
