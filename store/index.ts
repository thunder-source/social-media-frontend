import { configureStore, combineReducers } from '@reduxjs/toolkit';
import postsReducer from './slices/postsSlice';
import authReducer from './slices/authSlice';
import { apiSlice } from './api/apiSlice';
import { friendsApi } from './api/friendsApi';

const rootReducer = combineReducers({
  posts: postsReducer,
  auth: authReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  [friendsApi.reducerPath]: friendsApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat(apiSlice.middleware, friendsApi.middleware),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
