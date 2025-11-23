import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificationsReducer from './slices/notificationsSlice';
import { apiSlice } from './api/apiSlice';

import uiReducer from './slices/uiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  notifications: notificationsReducer,
  ui: uiReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat(
      apiSlice.middleware
    ),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
