import api from './axios';
import { User } from '@/store/slices/authSlice';

/**
 * Redirects to backend Google OAuth login
 */
export const loginWithGoogle = (): void => {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  window.location.href = `${backendUrl}/auth/google`;
};

/**
 * Logs out the user by calling backend logout endpoint
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
    // Continue even if logout fails on backend
  }
};

/**
 * Fetches the current authenticated user from backend
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<{ user: User }>('/auth/me');
  return response.data.user;
};

/**
 * Checks if user is authenticated by attempting to fetch current user
 */
export const checkAuth = async (): Promise<User | null> => {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    return null;
  }
};
