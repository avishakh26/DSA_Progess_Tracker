"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import { signupAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signupAction, undefined);

  return (
    <Card className="w-full max-w-sm p-6">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">Start your journey</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        We&apos;ll set up all 14 phases for you.
      </p>

      <form action={action} className="mt-6 flex flex-col gap-4">
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

        <Button type="submit" disabled={pending} className="mt-1">
          {pending ? <Loader2 className="animate-spin" /> : <UserPlus />}
          Create account
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
