"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth/site-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { toast } from "sonner";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "config") {
      toast.error(
        "Authentication is not configured on the server. Add Supabase environment variables in Vercel (or .env.local for local dev).",
      );
      return;
    }
    if (searchParams.get("error") === "auth") {
      const message =
        searchParams.get("message") ??
        "Email confirmation failed. Check Supabase Site URL and try signing in, or sign up again.";
      toast.error(message);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user && data.session) {
      try {
        await fetch("/api/auth/signup", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.session.access_token}`,
          },
          body: JSON.stringify({
            userId: data.user.id,
            email: data.user.email ?? email,
            orgName: data.user.user_metadata?.org_name,
            orgType: data.user.user_metadata?.org_type,
          }),
        });
      } catch {
        // Org may already exist; dashboard will still load if provision succeeded earlier
      }
    }

    toast.success("Signed in successfully");
    router.push(searchParams.get("redirect") ?? "/dashboard");
    router.refresh();
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error("Enter your email to receive a sign-in link.");
      return;
    }

    setMagicLinkLoading(true);

    const redirect = searchParams.get("redirect") ?? "/dashboard";
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: getAuthCallbackUrl(redirect),
      },
    });

    setMagicLinkLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setMagicLinkSent(true);
    toast.success("Check your email for a sign-in link.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-4">
      <Card className="w-full max-w-md border-line shadow-float">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex justify-center">
            <Logo />
          </div>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your cases
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="attorney@firm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-line" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={magicLinkLoading || magicLinkSent}
              onClick={handleMagicLink}
            >
              {magicLinkLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {magicLinkSent ? "Sign-in link sent" : "Email me a sign-in link"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
