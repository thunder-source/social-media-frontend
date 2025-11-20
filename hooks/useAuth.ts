import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = async () => {
    await signIn("google");
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    login,
    logout,
  };
};
