"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Route-level error boundary.
 *
 * Without this, any error thrown while rendering or hydrating a client
 * component unmounts the whole React tree and leaves a blank white page with
 * no explanation. This surfaces the message instead.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]/60 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--danger-soft)]">
            <AlertTriangle className="size-5 text-[var(--danger)]" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-[var(--foreground)]">
              Something broke while rendering this page
            </h1>
            <p className="text-sm text-[var(--muted)]">
              The error below is the actual cause.
            </p>
          </div>
        </div>

        <pre className="mt-4 max-h-64 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 font-mono text-xs whitespace-pre-wrap text-[var(--foreground)]">
          {error.message || "Unknown error"}
          {error.digest ? `\n\ndigest: ${error.digest}` : ""}
          {error.stack ? `\n\n${error.stack}` : ""}
        </pre>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
          >
            <RotateCcw className="size-4" />
            Try again
          </button>
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg border border-[var(--border)] px-3.5 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
