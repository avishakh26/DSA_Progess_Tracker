"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import { signupAction } from "./actions";
import type { AuthFormState } from "@/app/(auth)/login/actions";
import { withRetry } from "@/lib/action-retry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const [state, setState] = useState<AuthFormState>(undefined);
  const [pending, startTransition] = useTransition();
  const redirecting = state?.success === true;

  useEffect(() => {
    if (state?.success) {
      router.replace("/");
      router.refresh();
    }
  }, [state, router]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || redirecting) return;
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        setState(await withRetry(() => signupAction(undefined, formData)));
      } catch (err) {
        console.error("signupAction failed after retries:", err);
        setState({ error: "Couldn't reach the server. Check your connection and try again." });
      }
    });
  }

  return (
    <Card className="w-full max-w-sm p-6">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">Start your journey</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        We&apos;ll set up all 14 phases for you.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" placeholder="Your name" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
          />
        </div>

        {state?.error && (
          <p className="flex items-center gap-2 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3 py-2 text-xs text-rose-300">
            <AlertCircle className="size-3.5 shrink-0" />
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending || redirecting} className="mt-1">
          {pending || redirecting ? <Loader2 className="animate-spin" /> : <UserPlus />}
          {redirecting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
