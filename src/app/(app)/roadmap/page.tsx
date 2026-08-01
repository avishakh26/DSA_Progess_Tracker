import { Route } from "lucide-react";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PHASES } from "@/lib/roadmap-data";
import { PageHeader } from "@/components/layout/page-header";
import { PhaseCard, type PhaseCardData } from "@/components/roadmap/phase-card";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata = { title: "DSA Roadmap — DSA Journey" };

export default async function RoadmapPage() {
  const userId = await requireUserId();

  const topics = await prisma.topic.findMany({
    where: { userId },
    orderBy: { order: "asc" },
    include: { _count: { select: { problems: true } } },
  });

  const phases: PhaseCardData[] = PHASES.map((meta) => {
    const inPhase = topics.filter((t) => t.phase === meta.phase);
    const done = inPhase.filter((t) => t.status === "DONE").length;
    const skipped = inPhase.filter((t) => t.status === "SKIP").length;
    const counted = inPhase.length - skipped;

    return {
      ...meta,
      topics: inPhase.map((t) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        description: t.description,
        status: t.status,
        progress: t.progress,
        favorite: t.favorite,
        problemCount: t._count.problems,
      })),
      done,
      percent: counted > 0 ? Math.round((done / counted) * 100) : 0,
    };
  });

  const totalDone = phases.reduce((n, p) => n + p.done, 0);
  const totalTopics = topics.length;
  const overall =
    totalTopics > 0 ? Math.round((totalDone / totalTopics) * 100) : 0;

  // Open the first phase that still has work left, so the page lands you where
  // you actually are rather than always at phase 1.
  const firstIncomplete = phases.find((p) => p.percent < 100)?.phase ?? 1;

  return (
    <div>
      <PageHeader
        icon={Route}
        title="DSA Roadmap"
        description="Fourteen phases, from C++ fundamentals to network flow. Expand a phase to track its topics."
      />

      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-[var(--muted)]">Overall roadmap progress</p>
          <p className="text-sm text-[var(--foreground)] tabular-nums">
            <span className="text-lg font-semibold">{totalDone}</span>
            <span className="text-[var(--muted)]"> / {totalTopics} topics</span>
          </p>
        </div>
        <Progress value={overall} className="mt-3 h-2" />

        {/* Fourteen-segment phase rail */}
        <div className="mt-4 grid grid-cols-7 gap-1.5 sm:grid-cols-14">
          {phases.map((p) => (
            <div key={p.phase} className="flex flex-col items-center gap-1">
              <div
                className="h-1.5 w-full rounded-full"
                style={{
                  background:
                    p.percent === 100
                      ? p.accent
                      : `linear-gradient(90deg, ${p.accent} ${p.percent}%, rgba(148,163,184,0.12) ${p.percent}%)`,
                }}
              />
              <span className="text-[0.65rem] text-[var(--subtle)] tabular-nums">
                {p.phase}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {phases.map((p) => (
          <PhaseCard
            key={p.phase}
            data={p}
            defaultOpen={p.phase === firstIncomplete}
          />
        ))}
      </div>
    </div>
  );
}
