"use client";

import { useEffect } from "react";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { DotBackground } from "@/components/ui/dot-background";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, Share2, Globe, Zap, Shield } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "./(dashboard)/layout";
import FeedPage from "./(dashboard)/feed/page";

export default function Home() {
  const { isAuthenticated, isLoading, handleOAuthCallback } = useAuth();

  // Handle OAuth callback - extract token from URL if present
  useEffect(() => {
    handleOAuthCallback();
  }, [handleOAuthCallback]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <FeedPage />
      </DashboardLayout>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <DotBackground />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-24 pb-20 md:pt-36 md:pb-32 lg:pt-48 lg:pb-40 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-[100px] -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] -z-10 animate-pulse delay-1000" />

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-10 text-center">
            <div className="space-y-6 max-w-5xl">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-4">
                ✨ The Future of Social
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground/90 to-foreground/50 drop-shadow-sm">
                Connect. Share. <br />
                <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                  Inspire.
                </span>
              </h1>
              <p className="mx-auto max-w-[800px] text-muted-foreground text-lg md:text-xl lg:text-2xl leading-relaxed font-light">
                Experience a new era of social networking. Connect with friends, share your moments, and discover the world in real-time.
              </p>
            </div>

            <div className="w-full max-w-md space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl opacity-50 blur transition duration-500 group-hover:opacity-75"></div>
                <div className="relative bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl p-8 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="text-center space-y-1.5">
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground">Get Started</h3>
                      <p className="text-sm text-muted-foreground">Join our community today</p>
                    </div>
                    <div className="w-full">
                      <GoogleLoginButton />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium">
                      <span>Secure</span>
                      <span className="w-0.5 h-0.5 rounded-full bg-current" />
                      <span>Fast</span>
                      <span className="w-0.5 h-0.5 rounded-full bg-current" />
                      <span>Private</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-12 md:px-6 lg:py-24 mx-auto">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-items-center max-w-6xl mx-auto">
          <FeatureCard
            icon={<Users className="h-8 w-8 text-blue-500" />}
            title="Connect with Friends"
            description="Find and connect with people who share your interests. Build your network and stay in touch."
          />
          <FeatureCard
            icon={<MessageCircle className="h-8 w-8 text-green-500" />}
            title="Real-time Chat"
            description="Instantly message your friends. Share photos, videos, and thoughts in real-time conversations."
          />
          <FeatureCard
            icon={<Share2 className="h-8 w-8 text-purple-500" />}
            title="Share Moments"
            description="Post updates, photos, and stories. Let your friends know what you're up to and see their world."
          />
          <FeatureCard
            icon={<Globe className="h-8 w-8 text-indigo-500" />}
            title="Global Community"
            description="Join a diverse community of users from around the globe. Discover new cultures and perspectives."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-yellow-500" />}
            title="Lightning Fast"
            description="Built with the latest technology for a smooth, responsive, and lightning-fast user experience."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-red-500" />}
            title="Secure & Private"
            description="Your privacy is our priority. We use industry-standard security to keep your data safe and secure."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-8 mt-auto w-full">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row px-4">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © 2025 Social Media App. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-foreground/20 hover:shadow-lg hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader>
        <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
