import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { apiSlice } from './api/apiSlice';
import { friendsApi } from './api/friendsApi';
import { postsApi } from './api/postsApi';

import uiReducer from './slices/uiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  [friendsApi.reducerPath]: friendsApi.reducer,
  [postsApi.reducerPath]: postsApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat(
      apiSlice.middleware, 
      friendsApi.middleware,
      postsApi.middleware
    ),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
