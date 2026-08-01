"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Slim determinate progress bar. `color` takes any CSS color so phase cards can
 * tint their bar with the phase accent.
 */
function Progress({
  value,
  className,
  color,
  ...props
}: React.ComponentProps<"div"> & { value: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]",
        className,
      )}
      {...props}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${clamped}%`,
          background: color
            ? `linear-gradient(90deg, ${color}99, ${color})`
            : "linear-gradient(90deg, #3b82f6, #60a5fa)",
          boxShadow: color ? `0 0 12px -2px ${color}` : "0 0 12px -2px #3b82f6",
        }}
      />
    </div>
  );
}

export { Progress };
