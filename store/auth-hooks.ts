/**
 * Auth Hooks - Utility hooks for authentication in components
 * Use these hooks to easily access auth state and actions
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { 
  setToken, 
  clearToken, 
  saveTokenFromCallback,
  setUser,
  clearUser 
} from './slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Save token manually
  const saveToken = useCallback((token: string) => {
    dispatch(setToken(token));
  }, [dispatch]);

  // Remove token
  const removeToken = useCallback(() => {
    dispatch(clearToken());
  }, [dispatch]);

  // Save token from OAuth callback URL
  const handleOAuthCallback = useCallback(() => {
    dispatch(saveTokenFromCallback());
  }, [dispatch]);

  // Logout
  const logout = useCallback(() => {
    dispatch(clearUser());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    saveToken,
    removeToken,
    handleOAuthCallback,
    logout,
  };
};

/**
 * Get current auth token from Redux state
 */
export const useAuthToken = () => {
  const token = useAppSelector((state) => state.auth.token);
  return token;
};

/**
 * Check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated;
};
