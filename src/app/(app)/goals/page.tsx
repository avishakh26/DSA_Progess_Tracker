import { CalendarRange } from "lucide-react";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { GoalTimeline, type GoalRow } from "@/components/goals/goal-timeline";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata = { title: "Monthly Goals — DSA Journey" };

export default async function GoalsPage() {
  const userId = await requireUserId();

  const [goals, problems] = await Promise.all([
    prisma.monthlyGoal.findMany({ where: { userId }, orderBy: { month: "asc" } }),
    prisma.problem.findMany({ where: { userId }, select: { solvedDate: true } }),
  ]);

  // Month 1 is the calendar month of the first problem logged; if nothing has
  // been logged yet, it's the current month.
  const first = problems.reduce<Date | null>(
    (min, p) => (!min || p.solvedDate < min ? p.solvedDate : min),
    null,
  );
  const anchor = first ?? new Date();
  const anchorIndex = anchor.getUTCFullYear() * 12 + anchor.getUTCMonth();

  const solvedByMonth = new Map<number, number>();
  for (const p of problems) {
    const idx =
      p.solvedDate.getUTCFullYear() * 12 + p.solvedDate.getUTCMonth() - anchorIndex;
    solvedByMonth.set(idx + 1, (solvedByMonth.get(idx + 1) ?? 0) + 1);
  }

  const rows: GoalRow[] = goals.map((g) => ({
    id: g.id,
    month: g.month,
    title: g.title,
    focus: g.focus,
    description: g.description,
    target: g.target,
    progress: g.progress,
    completed: g.completed,
    solved: solvedByMonth.get(g.month) ?? 0,
  }));

  const overall =
    rows.length > 0
      ? Math.round(rows.reduce((n, g) => n + g.progress, 0) / rows.length)
      : 0;
  const completed = rows.filter((g) => g.completed).length;

  return (
    <div>
      <PageHeader
        icon={CalendarRange}
        title="Monthly Goals"
        description="Six months from STL fundamentals to dynamic programming and advanced structures."
      />

      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-[var(--muted)]">Six-month plan</p>
          <p className="text-sm text-[var(--foreground)] tabular-nums">
            <span className="text-lg font-semibold">{completed}</span>
            <span className="text-[var(--muted)]"> / {rows.length} months complete</span>
          </p>
        </div>
        <Progress value={overall} className="mt-3 h-2" />
        <p className="mt-2 text-xs text-[var(--subtle)]">
          {overall}% average progress across the plan. Click a month&apos;s circle to
          mark it complete, or use −/+ to nudge its progress.
        </p>
      </Card>

      <GoalTimeline goals={rows} />
    </div>
  );
}
