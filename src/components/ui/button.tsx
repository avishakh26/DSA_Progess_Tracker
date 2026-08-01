import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-white shadow-[0_4px_16px_-4px_rgba(59,130,246,0.5)] hover:bg-[var(--primary-hover)]",
        secondary:
          "bg-white/[0.06] text-[var(--foreground)] border border-[var(--border)] hover:bg-white/[0.1] hover:border-[var(--border-strong)]",
        outline:
          "border border-[var(--border-strong)] bg-transparent hover:bg-white/[0.05]",
        ghost: "hover:bg-white/[0.07] text-[var(--muted)] hover:text-[var(--foreground)]",
        danger:
          "bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/30 hover:bg-[var(--danger)] hover:text-white",
        success:
          "bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/30 hover:bg-[var(--success)] hover:text-white",
        link: "text-[var(--primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 [&_svg]:size-4",
        sm: "h-8 px-3 text-xs [&_svg]:size-3.5",
        lg: "h-11 px-6 text-base [&_svg]:size-5",
        icon: "size-9 [&_svg]:size-4",
        "icon-sm": "size-7 [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { Button, buttonVariants };
