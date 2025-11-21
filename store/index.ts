import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificationsReducer from './slices/notificationsSlice';
import { apiSlice } from './api/apiSlice';
import { friendsApi } from './api/friendsApi';
import { postsApi } from './api/postsApi';
import { notificationsApi } from './api/notificationsApi';

import uiReducer from './slices/uiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  notifications: notificationsReducer,
  ui: uiReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  [friendsApi.reducerPath]: friendsApi.reducer,
  [postsApi.reducerPath]: postsApi.reducer,
  [notificationsApi.reducerPath]: notificationsApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat(
      apiSlice.middleware, 
      friendsApi.middleware,
      postsApi.middleware,
      notificationsApi.middleware
    ),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
