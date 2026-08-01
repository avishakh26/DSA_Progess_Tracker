import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  ListChecks,
  Percent,
  Target,
  Trophy,
} from "lucide-react";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getDailySeries,
  getDashboardStats,
  getMonthlySeries,
  getPhaseProgress,
} from "@/lib/queries";
import {
  DIFFICULTY_META,
  PROBLEM_STATUS_META,
  platformLabel,
  type Difficulty,
  type ProblemStatus,
} from "@/lib/constants";
import { DIFFICULTY_RAMP } from "@/lib/viz";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/dashboard/stat-card";
import { ContributionHeatmap } from "@/components/dashboard/heatmap";
import {
  DailyBarChart,
  MonthlyStackedChart,
} from "@/components/charts/activity-charts";

export default async function DashboardPage() {
  const userId = await requireUserId();

  const [stats, phases, daily, monthly, recent] = await Promise.all([
    getDashboardStats(userId),
    getPhaseProgress(userId),
    getDailySeries(userId, 14),
    getMonthlySeries(userId, 6),
    prisma.problem.findMany({
      where: { userId },
      orderBy: { solvedDate: "desc" },
      take: 6,
      include: { topic: { select: { slug: true, title: true } } },
    }),
  ]);

  // "Continue learning" points at the first unfinished topic in phase order.
  const nextTopic = await prisma.topic.findFirst({
    where: { userId, status: "PENDING" },
    orderBy: { order: "asc" },
  });

  const goalPct = Math.min(
    100,
    Math.round((stats.solvedToday / Math.max(1, stats.dailyGoal)) * 100),
  );

  const difficultyRows = [
    { key: "EASY" as Difficulty, count: stats.difficulty.easy },
    { key: "MEDIUM" as Difficulty, count: stats.difficulty.medium },
    { key: "HARD" as Difficulty, count: stats.difficulty.hard },
  ];
  const difficultyTotal = Math.max(1, stats.totalProblems);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
          {greeting()}
          {stats.name ? `, ${stats.name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {stats.streak > 0
            ? `You're on a ${stats.streak}-day streak — keep it alive.`
            : "No active streak. Solve one problem today to start a new one."}
        </p>
      </div>

      {/* ── KPI row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Topics"
          value={stats.totalTopics}
          sub={`across 14 phases`}
          icon={ListChecks}
          accent="#3987e5"
        />
        <StatCard
          label="Completed"
          value={stats.doneTopics}
          sub={`${stats.pendingTopics} pending · ${stats.skippedTopics} skipped`}
          icon={CheckCircle2}
          accent="#199e70"
        />
        <StatCard
          label="Problems solved"
          value={stats.totalProblems}
          sub={`${stats.solvedProblems} solved · ${stats.revisionProblems} to revise`}
          icon={Trophy}
          accent="#c98500"
        />
        <StatCard
          label="Completion"
          value={`${stats.completion}%`}
          sub="of non-skipped topics"
          icon={Percent}
          accent="#9085e9"
        >
          <Progress value={stats.completion} />
        </StatCard>
        <StatCard
          label="Current streak"
          value={`${stats.streak}d`}
          sub={stats.streak > 0 ? "keep going" : "start today"}
          icon={Flame}
          accent="#d95926"
        />
        <StatCard
          label="Longest streak"
          value={`${stats.longestStreak}d`}
          sub="personal best"
          icon={Target}
          accent="#d55181"
        />
      </div>

      {/* ── Heatmap ─────────────────────────────────────────── */}
      <Card className="p-5">
        <CardTitle className="mb-4">Contribution heatmap</CardTitle>
        <ContributionHeatmap
          todayIso={new Date().toISOString()}
          activities={stats.activities.map((a) => ({
            date: a.date.toISOString(),
            count: a.count,
          }))}
        />
      </Card>

      {/* ── Charts + side rail ──────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardTitle className="mb-1">Last 14 days</CardTitle>
          <p className="mb-3 text-xs text-[var(--muted)]">
            Problems added per day.
          </p>
          <DailyBarChart data={daily} />
        </Card>

        {/* Today's goal + difficulty split. Difficulty is three labelled tiles
            rather than a pie — the labels carry identity, not the colour. */}
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <CardTitle className="mb-3">Today&apos;s goal</CardTitle>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-slate-100 tabular-nums">
                {stats.solvedToday}
              </span>
              <span className="text-sm text-[var(--muted)]">
                / {stats.dailyGoal} problems
              </span>
            </div>
            <Progress
              value={goalPct}
              className="mt-3"
              color={goalPct >= 100 ? "#199e70" : undefined}
            />
            <p className="mt-2 text-xs text-[var(--subtle)]">
              {goalPct >= 100
                ? "Goal met for today — anything else is a bonus."
                : `${stats.dailyGoal - stats.solvedToday} to go.`}
            </p>
          </Card>

          <Card className="flex-1 p-5">
            <CardTitle className="mb-3">Difficulty split</CardTitle>
            <ul className="flex flex-col gap-3">
              {difficultyRows.map((row) => (
                <li key={row.key}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: DIFFICULTY_RAMP[row.key] }}
                      />
                      {DIFFICULTY_META[row.key].label}
                    </span>
                    <span className="text-sm text-[var(--muted)] tabular-nums">
                      {row.count}
                    </span>
                  </div>
                  <Progress
                    value={(row.count / difficultyTotal) * 100}
                    color={DIFFICULTY_RAMP[row.key]}
                  />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardTitle className="mb-1">Monthly progress</CardTitle>
          <p className="mb-3 text-xs text-[var(--muted)]">
            Problems per month, split by difficulty.
          </p>
          <MonthlyStackedChart data={monthly} />
        </Card>

        {/* Continue learning */}
        <Card className="flex flex-col p-5">
          <CardTitle className="mb-3">Continue learning</CardTitle>
          {nextTopic ? (
            <>
              <p className="text-xs text-[var(--subtle)]">
                Phase {nextTopic.phase}
              </p>
              <p className="mt-1 text-lg font-medium text-slate-100">
                {nextTopic.title}
              </p>
              <p className="mt-1 line-clamp-3 text-sm text-[var(--muted)]">
                {nextTopic.description}
              </p>
              <Progress value={nextTopic.progress} className="mt-3" />
              <Button asChild className="mt-4 w-full">
                <Link href={`/roadmap/${nextTopic.slug}`}>
                  Open topic
                  <ArrowRight />
                </Link>
              </Button>
            </>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Nothing pending — every topic is done or skipped. 🎉
            </p>
          )}

          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-[var(--muted)] uppercase">
              Phase progress
            </p>
            <ul className="flex flex-col gap-2">
              {phases.slice(0, 6).map((p) => (
                <li key={p.phase} className="flex items-center gap-2">
                  <span className="w-6 shrink-0 text-xs text-[var(--subtle)] tabular-nums">
                    {p.phase}
                  </span>
                  <span className="min-w-0 flex-1">
                    <Progress value={p.percent} color={p.accent} />
                  </span>
                  <span className="w-9 shrink-0 text-right text-xs text-[var(--muted)] tabular-nums">
                    {p.percent}%
                  </span>
                </li>
              ))}
            </ul>
            <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
              <Link href="/roadmap">
                All 14 phases
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* ── Recently solved ─────────────────────────────────── */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recently solved</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/statistics">
              Statistics
              <ArrowRight />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--subtle)]">
              No problems logged yet. Open a topic to add your first one.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--border)]">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/roadmap/${p.topic.slug}`}
                    className="-mx-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-[var(--foreground)]">
                        {p.title}
                      </span>
                      <span className="block truncate text-xs text-[var(--subtle)]">
                        {platformLabel(p.platform)} · {p.topic.title}
                      </span>
                    </span>
                    <Badge variant={DIFFICULTY_META[p.difficulty as Difficulty]?.badge}>
                      {DIFFICULTY_META[p.difficulty as Difficulty]?.label}
                    </Badge>
                    <Badge
                      variant={PROBLEM_STATUS_META[p.status as ProblemStatus]?.badge}
                    >
                      {PROBLEM_STATUS_META[p.status as ProblemStatus]?.label}
                    </Badge>
                    <span className="w-20 shrink-0 text-right text-xs text-[var(--subtle)] tabular-nums">
                      {p.solvedDate.toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
