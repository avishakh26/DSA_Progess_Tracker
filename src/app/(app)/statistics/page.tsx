import { BarChart3 } from "lucide-react";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDailySeries, getMonthlySeries } from "@/lib/queries";
import { PHASES } from "@/lib/roadmap-data";
import { DIFFICULTY_META, platformLabel, type Difficulty } from "@/lib/constants";
import { DIFFICULTY_RAMP } from "@/lib/viz";
import { PageHeader } from "@/components/layout/page-header";
import {
  CumulativeAreaChart,
  DailyBarChart,
  HorizontalBarChart,
  MonthlyStackedChart,
} from "@/components/charts/activity-charts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata = { title: "Statistics — DSA Journey" };

export default async function StatisticsPage() {
  const userId = await requireUserId();

  const [monthly, daily, problems, topics] = await Promise.all([
    getMonthlySeries(userId, 12),
    getDailySeries(userId, 30),
    prisma.problem.findMany({
      where: { userId },
      select: {
        platform: true,
        difficulty: true,
        status: true,
        topicId: true,
      },
    }),
    prisma.topic.findMany({
      where: { userId },
      select: { id: true, phase: true, title: true, status: true },
    }),
  ]);

  // Platform distribution, biggest first, tail folded into "Other".
  const byPlatform = new Map<string, number>();
  for (const p of problems) {
    byPlatform.set(p.platform, (byPlatform.get(p.platform) ?? 0) + 1);
  }
  const platformRows = [...byPlatform.entries()]
    .map(([platform, value]) => ({ label: platformLabel(platform), value }))
    .sort((a, b) => b.value - a.value);
  const platformData =
    platformRows.length > 7
      ? [
          ...platformRows.slice(0, 6),
          {
            label: "Other",
            value: platformRows.slice(6).reduce((n, r) => n + r.value, 0),
          },
        ]
      : platformRows;

  // Problems per phase.
  const phaseOf = new Map(topics.map((t) => [t.id, t.phase]));
  const byPhase = new Map<number, number>();
  for (const p of problems) {
    const phase = phaseOf.get(p.topicId);
    if (phase === undefined) continue;
    byPhase.set(phase, (byPhase.get(phase) ?? 0) + 1);
  }
  const phaseData = PHASES.map((meta) => ({
    label: `${meta.phase}. ${meta.title}`,
    value: byPhase.get(meta.phase) ?? 0,
  }));

  // Topic status split.
  const topicStatus = {
    done: topics.filter((t) => t.status === "DONE").length,
    pending: topics.filter((t) => t.status === "PENDING").length,
    skipped: topics.filter((t) => t.status === "SKIP").length,
  };

  // Difficulty totals.
  const difficultyRows = (["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((d) => ({
    key: d,
    count: problems.filter((p) => p.difficulty === d).length,
  }));
  const difficultyTotal = Math.max(1, problems.length);

  // Cumulative total over the last 12 months.
  const cumulative = monthly.reduce<{ label: string; total: number }[]>(
    (acc, m) => [
      ...acc,
      { label: m.label, total: (acc.at(-1)?.total ?? 0) + m.total },
    ],
    [],
  );

  const statusRows = [
    { label: "Solved", value: problems.filter((p) => p.status === "SOLVED").length },
    {
      label: "Attempted",
      value: problems.filter((p) => p.status === "ATTEMPTED").length,
    },
    {
      label: "Revision needed",
      value: problems.filter((p) => p.status === "REVISION").length,
    },
  ];

  return (
    <div>
      <PageHeader
        icon={BarChart3}
        title="Statistics"
        description="Where your time has actually gone — by month, platform, difficulty and phase."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <CardTitle className="mb-1">Problems per month</CardTitle>
          <p className="mb-3 text-xs text-[var(--muted)]">
            Last 12 months, split by difficulty.
          </p>
          <MonthlyStackedChart data={monthly} />
        </Card>

        <Card className="p-5">
          <CardTitle className="mb-1">Cumulative total</CardTitle>
          <p className="mb-3 text-xs text-[var(--muted)]">
            Running count of every problem logged.
          </p>
          <CumulativeAreaChart data={cumulative} />
        </Card>

        <Card className="p-5 lg:col-span-2">
          <CardTitle className="mb-1">Last 30 days</CardTitle>
          <p className="mb-3 text-xs text-[var(--muted)]">Problems added per day.</p>
          <DailyBarChart data={daily} />
        </Card>

        <Card className="p-5">
          <CardTitle className="mb-1">Platform distribution</CardTitle>
          <p className="mb-3 text-xs text-[var(--muted)]">
            Where you solve most often.
          </p>
          {platformData.length > 0 ? (
            <HorizontalBarChart data={platformData} height={240} categorical />
          ) : (
            <EmptyChart />
          )}
        </Card>

        <Card className="p-5">
          <CardTitle className="mb-1">Difficulty & status</CardTitle>
          <p className="mb-4 text-xs text-[var(--muted)]">
            How the {problems.length} tracked problems break down.
          </p>

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
                    <span className="text-[var(--subtle)]">
                      {" "}
                      ({Math.round((row.count / difficultyTotal) * 100)}%)
                    </span>
                  </span>
                </div>
                <Progress
                  value={(row.count / difficultyTotal) * 100}
                  color={DIFFICULTY_RAMP[row.key]}
                />
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <ul className="flex flex-col gap-2">
              {statusRows.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[var(--muted)]">{row.label}</span>
                  <span className="text-slate-100 tabular-nums">{row.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <CardHeader className="p-0 pb-3">
            <CardTitle>Problems per phase</CardTitle>
            <p className="text-xs text-[var(--muted)]">
              Topics: {topicStatus.done} done · {topicStatus.pending} pending ·{" "}
              {topicStatus.skipped} skipped
            </p>
          </CardHeader>
          <HorizontalBarChart data={phaseData} height={420} />
        </Card>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <p className="py-12 text-center text-sm text-[var(--subtle)]">
      Nothing to chart yet — log a few problems first.
    </p>
  );
}
