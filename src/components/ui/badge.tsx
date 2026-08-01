import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-[var(--primary)]/30 bg-[var(--primary-soft)] text-blue-300",
        success:
          "border-[var(--success)]/30 bg-[var(--success-soft)] text-emerald-300",
        warning:
          "border-[var(--warning)]/30 bg-[var(--warning-soft)] text-amber-300",
        danger: "border-[var(--danger)]/30 bg-[var(--danger-soft)] text-rose-300",
        neutral: "border-[var(--border)] bg-white/[0.05] text-[var(--muted)]",
        purple: "border-violet-500/30 bg-violet-500/[0.14] text-violet-300",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
