import { BookMarked } from "lucide-react";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { phaseMeta } from "@/lib/roadmap-data";
import { PageHeader } from "@/components/layout/page-header";
import {
  ProblemSummaryList,
  type ProblemSummary,
} from "@/components/problems/problem-summary-list";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Revision Needed — DSA Journey" };

export default async function RevisionPage() {
  const userId = await requireUserId();

  const problems = await prisma.problem.findMany({
    where: { userId, status: "REVISION" },
    orderBy: { solvedDate: "desc" },
    include: { topic: { select: { slug: true, title: true, phase: true } } },
  });

  // Group by phase so a revision session can target one area at a time.
  const groups = new Map<number, ProblemSummary[]>();
  for (const p of problems) {
    const row: ProblemSummary = {
      id: p.id,
      title: p.title,
      platform: p.platform,
      problemLink: p.problemLink,
      solutionLink: p.solutionLink,
      difficulty: p.difficulty,
      status: p.status,
      solvedDate: p.solvedDate.toISOString(),
      tags: p.tags,
      notes: p.notes,
      favorite: p.favorite,
      topicSlug: p.topic.slug,
      topicTitle: p.topic.title,
    };
    const list = groups.get(p.topic.phase) ?? [];
    list.push(row);
    groups.set(p.topic.phase, list);
  }

  const phases = [...groups.keys()].sort((a, b) => a - b);

  return (
    <div>
      <PageHeader
        icon={BookMarked}
        title="Revision Needed"
        description="Everything you flagged to come back to, grouped by phase."
      />

      {problems.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-[var(--muted)]">
            Nothing flagged for revision. 🎉
          </p>
          <p className="mt-1 text-xs text-[var(--subtle)]">
            Set a problem&apos;s status to &ldquo;Revision needed&rdquo; and it will
            show up here.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-[var(--muted)]">
            <span className="font-semibold text-slate-100 tabular-nums">
              {problems.length}
            </span>{" "}
            problems across {phases.length} phase{phases.length === 1 ? "" : "s"}.
          </p>

          {phases.map((phase) => {
            const meta = phaseMeta(phase);
            const rows = groups.get(phase)!;
            return (
              <section key={phase}>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-100">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: meta.accent }}
                  />
                  Phase {phase} · {meta.title}
                  <span className="text-[var(--subtle)] tabular-nums">
                    ({rows.length})
                  </span>
                </h2>
                <ProblemSummaryList problems={rows} showResolve />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
