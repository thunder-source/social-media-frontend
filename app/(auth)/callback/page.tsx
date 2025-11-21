"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser, setAuthLoading } from "@/store/slices/authSlice";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Check for error in query params
      const searchParams = new URLSearchParams(window.location.search);
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Authentication failed. Please try again.");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        return;
      }

      try {
        dispatch(setAuthLoading(true));
        
        // Fetch user data from backend /api/auth/me
        const user = await getCurrentUser();
        
        // Store user in Redux
        dispatch(setUser(user));
        
        // Redirect to feed
        router.push("/feed");
      } catch (err) {
        console.error("Authentication callback error:", err);
        setError("Failed to authenticate. Please try again.");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [dispatch, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Authentication Failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Redirecting to login page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Authenticating
          </CardTitle>
          <CardDescription>
            Please wait while we complete your sign in...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
