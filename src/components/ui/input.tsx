import * as React from "react";
import { cn } from "@/lib/utils";

const fieldStyles =
  "w-full rounded-lg border border-[var(--border)] bg-slate-950/40 px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--subtle)] transition-colors hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/25 disabled:cursor-not-allowed disabled:opacity-50";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input type={type} className={cn(fieldStyles, "h-9", className)} {...props} />
  );
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(fieldStyles, "min-h-20 resize-y", className)} {...props} />;
}

/** Native select styled to match — simpler and more reliable than a Radix popup
 *  inside dialogs, and it works on touch devices for free. */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        fieldStyles,
        "h-9 appearance-none bg-[length:1rem] bg-[right_0.6rem_center] bg-no-repeat pr-8",
        "[&>option]:bg-slate-900 [&>option]:text-slate-100",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-xs font-medium tracking-wide text-[var(--muted)] uppercase",
        className,
      )}
      {...props}
    />
  );
}

export { Input, Textarea, Select, Label, fieldStyles };
