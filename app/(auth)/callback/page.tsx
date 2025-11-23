"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { apiSlice } from "@/store/api/apiSlice";
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
          router.push("/");
        }, 3000);
        return;
      }

      // Note: Token handling is now done globally by TokenHandler component
      // Wait a bit to ensure TokenHandler has processed the token
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        // Fetch user data from backend /api/auth/me using RTK Query
        // @ts-ignore
        await dispatch(apiSlice.endpoints.getCurrentUser.initiate()).unwrap();

        // Redirect to feed
        router.push("/");
      } catch (err) {
        console.error("Authentication callback error:", err);
        setError("Failed to authenticate. Please try again.");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/");
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
