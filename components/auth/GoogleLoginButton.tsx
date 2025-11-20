"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { Chrome } from "lucide-react";

export default function GoogleLoginButton() {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => signIn("google", { callbackUrl: "/feed" })}
    >
      <Chrome className="mr-2 h-4 w-4" />
      Sign in with Google
    </Button>
  );
}
