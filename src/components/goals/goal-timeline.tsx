"use client";

import { useTransition } from "react";
import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setGoalProgress, toggleGoalCompleted } from "@/actions/goals";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type GoalRow = {
  id: string;
  month: number;
  title: string;
  focus: string;
  description: string | null;
  target: number;
  progress: number;
  completed: boolean;
  solved: number;
};

export function GoalTimeline({ goals }: { goals: GoalRow[] }) {
  return (
    <ol className="relative flex flex-col gap-4">
      {/* Spine */}
      <span
        aria-hidden
        className="absolute top-6 bottom-6 left-[19px] w-px bg-gradient-to-b from-[var(--primary)]/50 via-[var(--border-strong)] to-transparent"
      />
      {goals.map((goal, i) => (
        <GoalItem key={goal.id} goal={goal} index={i} />
      ))}
    </ol>
  );
}

function GoalItem({ goal, index }: { goal: GoalRow; index: number }) {
  const [pending, startTransition] = useTransition();

  const nudge = (delta: number) => {
    startTransition(async () => {
      await setGoalProgress(goal.id, goal.progress + delta);
    });
  };

  const toggle = () => {
    startTransition(async () => {
      const now = await toggleGoalCompleted(goal.id);
      toast.success(now ? "Month completed 🎉" : "Marked in progress");
    });
  };

  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative flex gap-4 pl-0"
    >
      {/* Node */}
      <button
        onClick={toggle}
        disabled={pending}
        title={goal.completed ? "Mark as in progress" : "Mark as complete"}
        className={cn(
          "relative z-10 mt-1 grid size-10 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold transition-colors",
          goal.completed
            ? "border-emerald-500 bg-emerald-500 text-slate-950"
            : "border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-blue-300",
        )}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : goal.completed ? (
          <Check className="size-5" />
        ) : (
          goal.month
        )}
      </button>

      <Card hover className="min-w-0 flex-1 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs tracking-wide text-[var(--subtle)] uppercase">
              Month {goal.month}
            </p>
            <h3 className="mt-0.5 text-base font-semibold text-[var(--foreground)]">
              {goal.title}
            </h3>
            <p className="text-sm text-blue-300">{goal.focus}</p>
          </div>
          <Badge variant={goal.completed ? "success" : "neutral"}>
            {goal.completed ? "Complete" : `${goal.progress}%`}
          </Badge>
        </div>

        {goal.description && (
          <p className="mt-2 text-sm text-[var(--muted)]">{goal.description}</p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <Progress
            value={goal.progress}
            className="h-2 flex-1"
            color={goal.completed ? "#10b981" : undefined}
          />
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => nudge(-10)}
              disabled={pending || goal.progress <= 0}
              className="grid size-6 place-items-center rounded-md border border-[var(--border)] text-xs text-[var(--muted)] transition-colors hover:bg-white/[0.07] disabled:opacity-40"
              aria-label="Decrease progress"
            >
              −
            </button>
            <button
              onClick={() => nudge(10)}
              disabled={pending || goal.progress >= 100}
              className="grid size-6 place-items-center rounded-md border border-[var(--border)] text-xs text-[var(--muted)] transition-colors hover:bg-white/[0.07] disabled:opacity-40"
              aria-label="Increase progress"
            >
              +
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-[var(--subtle)] tabular-nums">
          {goal.solved} problems logged this month · target {goal.target}
        </p>
      </Card>
    </motion.li>
  );
}
