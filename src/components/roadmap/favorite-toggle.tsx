"use client";

import { useOptimistic, useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { toggleTopicFavorite } from "@/actions/topics";
import { toggleProblemFavorite } from "@/actions/problems";
import { cn } from "@/lib/utils";

export function FavoriteToggle({
  id,
  favorite,
  kind = "topic",
  className,
}: {
  id: string;
  favorite: boolean;
  kind?: "topic" | "problem";
  className?: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(favorite);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={optimistic}
      title={optimistic ? "Remove from favorites" : "Add to favorites"}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        startTransition(async () => {
          setOptimistic(!optimistic);
          const now =
            kind === "topic"
              ? await toggleTopicFavorite(id)
              : await toggleProblemFavorite(id);
          toast.success(now ? "Added to favorites" : "Removed from favorites");
        });
      }}
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-md transition-colors",
        optimistic
          ? "text-amber-400 hover:bg-amber-400/10"
          : "text-[var(--subtle)] hover:bg-white/[0.07] hover:text-[var(--muted)]",
        className,
      )}
    >
      <Star className={cn("size-4", optimistic && "fill-current")} />
    </button>
  );
}
