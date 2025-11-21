import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { clearUser } from "@/store/slices/authSlice";
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

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };
};

