"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chrome, Loader2 } from "lucide-react";
import { loginWithGoogle } from "@/lib/auth";

export default function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    loginWithGoogle();
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Chrome className="mr-2 h-4 w-4" />
      )}
      Sign in with Google
    </Button>
  );
}
