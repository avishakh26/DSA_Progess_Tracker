import "server-only";

import { prisma } from "@/lib/prisma";
import { PHASES } from "@/lib/roadmap-data";

export function startOfUtcDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

const DAY_MS = 86_400_000;

/**
 * Current and longest run of consecutive active days.
 *
 * `current` tolerates *today* being empty — a streak only breaks once a full
 * day has been missed, otherwise the number would read 0 every morning.
 */
export function computeStreaks(days: Date[]) {
  if (days.length === 0) return { current: 0, longest: 0 };

  const stamps = [...new Set(days.map((d) => startOfUtcDay(d).getTime()))].sort(
    (a, b) => a - b,
  );

  let longest = 1;
  let run = 1;
  for (let i = 1; i < stamps.length; i++) {
    run = stamps[i] - stamps[i - 1] === DAY_MS ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = startOfUtcDay(new Date()).getTime();
  const last = stamps[stamps.length - 1];
  if (last !== today && last !== today - DAY_MS) {
    return { current: 0, longest };
  }

  let current = 1;
  for (let i = stamps.length - 1; i > 0; i--) {
    if (stamps[i] - stamps[i - 1] !== DAY_MS) break;
    current++;
  }

  return { current, longest };
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

export async function getDashboardStats(userId: string) {
  const [
    totalTopics,
    doneTopics,
    pendingTopics,
    skippedTopics,
    totalProblems,
    solvedProblems,
    attemptedProblems,
    revisionProblems,
    easy,
    medium,
    hard,
    activities,
    user,
  ] = await Promise.all([
    prisma.topic.count({ where: { userId } }),
    prisma.topic.count({ where: { userId, status: "DONE" } }),
    prisma.topic.count({ where: { userId, status: "PENDING" } }),
    prisma.topic.count({ where: { userId, status: "SKIP" } }),
    prisma.problem.count({ where: { userId } }),
    prisma.problem.count({ where: { userId, status: "SOLVED" } }),
    prisma.problem.count({ where: { userId, status: "ATTEMPTED" } }),
    prisma.problem.count({ where: { userId, status: "REVISION" } }),
    prisma.problem.count({ where: { userId, difficulty: "EASY" } }),
    prisma.problem.count({ where: { userId, difficulty: "MEDIUM" } }),
    prisma.problem.count({ where: { userId, difficulty: "HARD" } }),
    prisma.activity.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      select: { date: true, count: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoal: true, name: true },
    }),
  ]);

  const streaks = computeStreaks(activities.map((a) => a.date));
  const today = startOfUtcDay(new Date()).getTime();
  const solvedToday =
    activities.find((a) => startOfUtcDay(a.date).getTime() === today)?.count ?? 0;

  // Skipped topics are excluded from the denominator — deliberately skipping a
  // topic shouldn't permanently cap completion below 100%.
  const denominator = totalTopics - skippedTopics;
  const completion =
    denominator > 0 ? Math.round((doneTopics / denominator) * 100) : 0;

  return {
    totalTopics,
    doneTopics,
    pendingTopics,
    skippedTopics,
    totalProblems,
    solvedProblems,
    attemptedProblems,
    revisionProblems,
    difficulty: { easy, medium, hard },
    completion,
    streak: streaks.current,
    longestStreak: streaks.longest,
    solvedToday,
    dailyGoal: user?.dailyGoal ?? 3,
    name: user?.name ?? null,
    activities,
  };
}

/** Per-phase completion, used by the roadmap page and the dashboard rail. */
export async function getPhaseProgress(userId: string) {
  const topics = await prisma.topic.findMany({
    where: { userId },
    select: { phase: true, status: true, progress: true },
  });

  return PHASES.map((meta) => {
    const inPhase = topics.filter((t) => t.phase === meta.phase);
    const done = inPhase.filter((t) => t.status === "DONE").length;
    const skipped = inPhase.filter((t) => t.status === "SKIP").length;
    const counted = inPhase.length - skipped;

    return {
      ...meta,
      total: inPhase.length,
      done,
      skipped,
      percent: counted > 0 ? Math.round((done / counted) * 100) : 0,
    };
  });
}

/** Problems per calendar month for the last `months` months. */
export async function getMonthlySeries(userId: string, months = 6) {
  const problems = await prisma.problem.findMany({
    where: { userId },
    select: { solvedDate: true, difficulty: true },
  });

  const now = new Date();
  const buckets: {
    key: string;
    label: string;
    total: number;
    easy: number;
    medium: number;
    hard: number;
  }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    buckets.push({
      key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`,
      label: d.toLocaleString("en", { month: "short", timeZone: "UTC" }),
      total: 0,
      easy: 0,
      medium: 0,
      hard: 0,
    });
  }

  const index = new Map(buckets.map((b, i) => [b.key, i]));
  for (const p of problems) {
    const key = `${p.solvedDate.getUTCFullYear()}-${p.solvedDate.getUTCMonth()}`;
    const i = index.get(key);
    if (i === undefined) continue;
    buckets[i].total++;
    if (p.difficulty === "EASY") buckets[i].easy++;
    else if (p.difficulty === "MEDIUM") buckets[i].medium++;
    else buckets[i].hard++;
  }

  return buckets;
}

/** Problems per day for the last `days` days — the weekly/daily bar chart. */
export async function getDailySeries(userId: string, days = 14) {
  const today = startOfUtcDay(new Date());
  const from = new Date(today.getTime() - (days - 1) * DAY_MS);

  const activities = await prisma.activity.findMany({
    where: { userId, date: { gte: from } },
    select: { date: true, count: true },
  });

  const byDay = new Map(
    activities.map((a) => [startOfUtcDay(a.date).getTime(), a.count]),
  );

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(from.getTime() + i * DAY_MS);
    return {
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      count: byDay.get(d.getTime()) ?? 0,
    };
  });
}
