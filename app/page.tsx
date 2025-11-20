import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/50 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Social Media App Template</h1>
        <p className="text-lg text-muted-foreground">
          A minimal UI template using shadcn/ui and Next.js 16.
        </p>
      </div>

      <div className="grid gap-4 w-full max-w-sm">
        <Button asChild size="lg" className="w-full">
          <Link href="/login">Go to Login</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/feed">Go to Feed (Dashboard)</Link>
        </Button>
        <div className="grid grid-cols-2 gap-4">
          <Button asChild variant="secondary">
            <Link href="/chat">Chat</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/friends">Friends</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        <p>Note: This is a UI template. Auth logic is not fully implemented.</p>
      </div>
    </div>
  );
}
