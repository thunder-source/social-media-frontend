import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { clearUser, setToken, setUser } from "@/store/slices/authSlice";
import { apiSlice, useGetCurrentUserQuery } from "@/store/api/apiSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // Automatically check auth status on mount using RTK Query hook
  // This triggers the fetch, which in turn updates the authSlice via extraReducers
  useGetCurrentUserQuery();
  
  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  
  const [triggerLogout] = apiSlice.useLogoutMutation();

  // Check authentication status on mount
  // Note: With RTK Query, we can just use the hook in the component, 
  // but to keep this hook interface consistent, we can expose a method or 
  // just rely on the fact that the query might be running elsewhere or we trigger it manually.
  // However, the original checkAuthStatus was called manually.
  // Let's keep the interface but use initiate().
  const logout = async () => {
    try {
      await triggerLogout().unwrap();
      dispatch(clearUser());
      router.push("/");
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout failed:", error);
      // Clear state anyway
      dispatch(clearUser());
      router.push("/");
      toast.error(error?.data?.message || "Logout failed");
    }
  };

  // Handle OAuth callback - extract token and user from URL
  const handleOAuthCallback = useCallback(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');

    let hasData = false;

    // Extract and save token if present
    if (token) {
      dispatch(setToken(token));
      hasData = true;
    }

    // Extract and save user data if present
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        dispatch(setUser(userData));
        hasData = true;
      } catch (error) {
        console.error('Failed to parse user data from URL:', error);
      }
    }

    // Clean up URL by removing OAuth parameters
    if (hasData) {
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      url.searchParams.delete('user');
      window.history.replaceState({}, '', url.toString());
      
      toast.success("Logged in successfully");
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    handleOAuthCallback,
  };
};

