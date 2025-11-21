import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setUser, clearUser, setAuthLoading } from "@/store/slices/authSlice";
import { logout as logoutApi, checkAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  // Check authentication status on mount
  const checkAuthStatus = async () => {
    if (isAuthenticated) return; // Already authenticated
    
    try {
      dispatch(setAuthLoading(true));
      const user = await checkAuth();
      
      if (user) {
        dispatch(setUser(user));
      } else {
        dispatch(setAuthLoading(false));
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      dispatch(setAuthLoading(false));
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
      dispatch(clearUser());
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear state anyway
      dispatch(clearUser());
      router.push("/login");
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    checkAuthStatus,
    logout,
  };
};

