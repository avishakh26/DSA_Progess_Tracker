"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, LogIn, Loader2 } from "lucide-react";
import { loginAction, type AuthFormState } from "./actions";
import { withRetry } from "@/lib/action-retry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [state, setState] = useState<AuthFormState>(undefined);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (state?.success) {
      router.replace("/");
      router.refresh();
    }
  }, [state, router]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        setState(await withRetry(() => loginAction(undefined, formData)));
      } catch (err) {
        console.error("loginAction failed after retries:", err);
        setState({ error: "Couldn't reach the server. Check your connection and try again." });
      }
    });
  }

  return (
    <Card className="w-full max-w-sm p-6">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">Welcome back</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Sign in to pick up where you left off.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            defaultValue="demo@dsajourney.dev"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            defaultValue="demo1234"
          />
        </div>

        {state?.error && (
          <p className="flex items-center gap-2 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3 py-2 text-xs text-rose-300">
            <AlertCircle className="size-3.5 shrink-0" suppressHydrationWarning />
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="mt-1">
          {pending ? (
            <Loader2 className="animate-spin" suppressHydrationWarning />
          ) : (
            <LogIn suppressHydrationWarning />
          )}
          Sign in
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        No account?{" "}
        <Link href="/signup" className="text-[var(--primary)] hover:underline">
          Create one
        </Link>
      </p>

      <p className="mt-4 rounded-lg border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-center text-xs text-[var(--subtle)]">
        Demo account is pre-filled — just hit sign in.
      </p>
    </Card>
  );
}
