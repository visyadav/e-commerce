"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { ROUTES } from "@/src/constants/routes";
import type { ApiError } from "@/src/types/api";

export function LoginForm() {
  const router = useRouter();
  const { login, state } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">E-Commerce Panel</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage your store
        </p>
      </div>

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
