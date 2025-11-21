import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/auth';
import { apiSlice } from '../api/apiSlice';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onlineUsers: string[];
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start loading to check for session
  onlineUsers: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
    setUserOnline: (state, action: PayloadAction<string>) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    setUserOffline: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        apiSlice.endpoints.getCurrentUser.matchFulfilled,
        (state, action) => {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.isLoading = false;
        }
      )
      .addMatcher(
        apiSlice.endpoints.getCurrentUser.matchRejected,
        (state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
        }
      )
      .addMatcher(
        apiSlice.endpoints.logout.matchFulfilled,
        (state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
        }
      );
  },
});

export const { 
  setUser, 
  clearUser, 
  setAuthLoading,
  setOnlineUsers, 
  setUserOnline, 
  setUserOffline 
} = authSlice.actions;
export default authSlice.reducer;
