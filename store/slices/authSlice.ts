import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email?: string;
  name?: string;
  photo?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onlineUsers: string[];
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false, // Start loading to check for session
  onlineUsers: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initialState: (state , action: PayloadAction<AuthState>) => {
      state.user = action.payload.user;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.isLoading = action.payload.isLoading;
      state.onlineUsers = action.payload.onlineUsers;
    },
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
