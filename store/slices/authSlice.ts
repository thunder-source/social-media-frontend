import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/auth';
import { apiSlice } from '../api/apiSlice';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onlineUsers: Record<string, string>; // userId -> timestamp
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage.getItem error:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('localStorage.setItem error:', error);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage.removeItem error:', error);
    }
  },
};

// Load initial state from localStorage
const loadInitialToken = (): string | null => {
  return safeLocalStorage.getItem(TOKEN_KEY);
};

const loadInitialUser = (): User | null => {
  const userJson = safeLocalStorage.getItem(USER_KEY);
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      return null;
    }
  }
  return null;
};

const initialState: AuthState = {
  user: loadInitialUser(),
  token: loadInitialToken(),
  isAuthenticated: !!loadInitialToken(),
  isLoading: true, // Start loading to check for session
  onlineUsers: {},
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      safeLocalStorage.setItem(USER_KEY, JSON.stringify(action.payload));
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      safeLocalStorage.removeItem(TOKEN_KEY);
      safeLocalStorage.removeItem(USER_KEY);
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      safeLocalStorage.setItem(TOKEN_KEY, action.payload);
    },
    clearToken: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      safeLocalStorage.removeItem(TOKEN_KEY);
    },
    /**
     * Save token and user data from OAuth callback URL
     * Call this action after OAuth redirect
     */
    saveTokenFromCallback: (state) => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userJson = urlParams.get('user');

      if (token) {
        state.token = token;
        state.isAuthenticated = true;
        safeLocalStorage.setItem(TOKEN_KEY, token);
      }

      if (userJson) {
        try {
          const user = JSON.parse(decodeURIComponent(userJson));
          state.user = user;
          safeLocalStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (error) {
          console.error('Failed to parse user data from URL:', error);
        }
      }

      // Clean URL by removing query params
      if (token || userJson) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      // Convert array of IDs to Record with current timestamp
      const timestamp = new Date().toISOString();
      state.onlineUsers = action.payload.reduce((acc, userId) => {
        acc[userId] = timestamp;
        return acc;
      }, {} as Record<string, string>);
    },
    setUserOnline: (state, action: PayloadAction<{ userId: string; timestamp: string }>) => {
      state.onlineUsers[action.payload.userId] = action.payload.timestamp;
    },
    setUserOffline: (state, action: PayloadAction<string>) => {
      delete state.onlineUsers[action.payload];
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
          safeLocalStorage.setItem(USER_KEY, JSON.stringify(action.payload));
        }
      )
      .addMatcher(
        apiSlice.endpoints.getCurrentUser.matchRejected,
        (state) => {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          safeLocalStorage.removeItem(TOKEN_KEY);
          safeLocalStorage.removeItem(USER_KEY);
        }
      )
      .addMatcher(
        apiSlice.endpoints.logout.matchFulfilled,
        (state) => {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          safeLocalStorage.removeItem(TOKEN_KEY);
          safeLocalStorage.removeItem(USER_KEY);
        }
      );
  },
});

export const { 
  setUser, 
  clearUser, 
  setAuthLoading,
  setToken,
  clearToken,
  saveTokenFromCallback,
  setOnlineUsers, 
  setUserOnline, 
  setUserOffline 
} = authSlice.actions;
export default authSlice.reducer;
