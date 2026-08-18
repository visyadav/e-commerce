"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { ROUTES } from "@/src/constants/routes";
import type { ApiError } from "@/src/types/api";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, state } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      setIsExpired(true);
      toast.error("You are logged out. Please login again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      toast.success("Successfully logged in!");
      router.push(ROUTES.HOME);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to log in");
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border bg-card/50 p-8 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">E-Commerce Panel</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage your store
        </p>
      </div>

      {isExpired && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <span>You are logged out. Please login again.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-sm font-medium leading-none">
            Email Address
          </label>
          <Input
            id="login-email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 transition-all focus-visible:ring-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium leading-none">
              Password
            </label>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 transition-all focus-visible:ring-2"
          />
        </div>

        <Button type="submit" className="h-11 w-full font-semibold" disabled={state.isLoading}>
          {state.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href={ROUTES.REGISTER} className="font-semibold text-primary hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}
