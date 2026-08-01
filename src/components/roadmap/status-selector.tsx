"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setTopicStatus } from "@/actions/topics";
import { TOPIC_STATUSES, TOPIC_STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Three-way segmented control. Optimism isn't worth it here — the server action
 * revalidates the whole layout (counts in the sidebar move too), so we just
 * disable during the transition.
 */
export function StatusSelector({
  topicId,
  status,
  size = "default",
}: {
  topicId: string;
  status: string;
  size?: "default" | "sm";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-[var(--border)] bg-slate-950/40 p-0.5",
        pending && "opacity-60",
      )}
    >
      {TOPIC_STATUSES.map((s) => {
        const meta = TOPIC_STATUS_META[s];
        const active = status === s;

        return (
          <button
            key={s}
            type="button"
            disabled={pending}
            title={meta.label}
            onClick={(e) => {
              e.stopPropagation();
              if (active) return;
              startTransition(async () => {
                await setTopicStatus(topicId, s);
                toast.success(`Marked ${meta.label.toLowerCase()}`);
              });
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-md font-medium transition-colors",
              size === "sm" ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-sm",
              active
                ? "text-slate-100"
                : "text-[var(--subtle)] hover:bg-white/[0.06] hover:text-[var(--muted)]",
            )}
            style={
              active
                ? { background: `${meta.color}26`, color: meta.color }
                : undefined
            }
          >
            <span aria-hidden>{meta.emoji}</span>
            <span className={size === "sm" ? "hidden sm:inline" : ""}>
              {meta.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
