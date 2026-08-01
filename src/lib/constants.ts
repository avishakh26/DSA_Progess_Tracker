import type { badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

// ── Topic status ─────────────────────────────────────────────

export const TOPIC_STATUSES = ["DONE", "PENDING", "SKIP"] as const;
export type TopicStatus = (typeof TOPIC_STATUSES)[number];

export const TOPIC_STATUS_META: Record<
  TopicStatus,
  { label: string; emoji: string; badge: BadgeVariant; color: string }
> = {
  DONE: { label: "Done", emoji: "✅", badge: "success", color: "#10b981" },
  PENDING: { label: "Pending", emoji: "⏳", badge: "warning", color: "#f59e0b" },
  SKIP: { label: "Skip", emoji: "⏭", badge: "neutral", color: "#64748b" },
};

// ── Problem status ───────────────────────────────────────────

export const PROBLEM_STATUSES = ["SOLVED", "ATTEMPTED", "REVISION"] as const;
export type ProblemStatus = (typeof PROBLEM_STATUSES)[number];

export const PROBLEM_STATUS_META: Record<
  ProblemStatus,
  { label: string; badge: BadgeVariant; color: string }
> = {
  SOLVED: { label: "Solved", badge: "success", color: "#10b981" },
  ATTEMPTED: { label: "Attempted", badge: "warning", color: "#f59e0b" },
  REVISION: { label: "Revision needed", badge: "danger", color: "#f43f5e" },
};

// ── Difficulty ───────────────────────────────────────────────

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; badge: BadgeVariant; color: string }
> = {
  EASY: { label: "Easy", badge: "success", color: "#10b981" },
  MEDIUM: { label: "Medium", badge: "warning", color: "#f59e0b" },
  HARD: { label: "Hard", badge: "danger", color: "#f43f5e" },
};

// ── Platform ─────────────────────────────────────────────────

export const PLATFORMS = [
  "CODEFORCES",
  "LEETCODE",
  "CODECHEF",
  "ATCODER",
  "HACKERRANK",
  "GFG",
  "CSES",
  "SPOJ",
  "OTHER",
] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_META: Record<Platform, { label: string; color: string }> = {
  CODEFORCES: { label: "Codeforces", color: "#ef4444" },
  LEETCODE: { label: "LeetCode", color: "#f59e0b" },
  CODECHEF: { label: "CodeChef", color: "#a16207" },
  ATCODER: { label: "AtCoder", color: "#e2e8f0" },
  HACKERRANK: { label: "HackerRank", color: "#10b981" },
  GFG: { label: "GeeksforGeeks", color: "#22c55e" },
  CSES: { label: "CSES", color: "#3b82f6" },
  SPOJ: { label: "SPOJ", color: "#8b5cf6" },
  OTHER: { label: "Other", color: "#94a3b8" },
};

export function platformLabel(value: string) {
  return PLATFORM_META[value as Platform]?.label ?? value;
}

export function platformColor(value: string) {
  return PLATFORM_META[value as Platform]?.color ?? "#94a3b8";
}

// ── Tags ─────────────────────────────────────────────────────

export const splitTags = (raw: string | null | undefined) =>
  (raw ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

export const joinTags = (tags: string[]) =>
  [...new Set(tags.map((t) => t.trim()).filter(Boolean))].join(",");
