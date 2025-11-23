/**
 * Redux Selectors for Auth State
 * Use these to efficiently select auth data from Redux store
 */

import { RootState } from '../index';

export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectOnlineUsers = (state: RootState) => state.auth.onlineUsers;

/**
 * Check if a specific user is online
 */
export const selectIsUserOnline = (userId: string) => (state: RootState) => {
  return userId in state.auth.onlineUsers;
};
