"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={null}>
      <UpdatePasswordContent />
    </Suspense>
  );
}

function UpdatePasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setCheckingSession(false);
      if (!session) {
        toast.error("Reset link expired or invalid. Request a new one.");
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated. You are signed in.");
    router.push("/dashboard");
    router.refresh();
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-4">
        <Card className="w-full max-w-md border-line shadow-float">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex justify-center">
              <Logo />
            </div>
            <CardTitle>Link expired</CardTitle>
            <CardDescription>
              Request a new password reset link to continue.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <Button asChild className="w-full">
              <Link href="/forgot-password">Request reset link</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="font-medium text-primary hover:underline">
                Back to sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-4">
      <Card className="w-full max-w-md border-line shadow-float">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex justify-center">
            <Logo />
          </div>
          <CardTitle>Choose a new password</CardTitle>
          <CardDescription>
            Enter a new password for your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdate}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
