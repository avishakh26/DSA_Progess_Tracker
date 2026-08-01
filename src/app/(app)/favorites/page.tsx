import Link from "next/link";
import { Star } from "lucide-react";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { phaseMeta } from "@/lib/roadmap-data";
import { TOPIC_STATUS_META, type TopicStatus } from "@/lib/constants";
import { PageHeader } from "@/components/layout/page-header";
import { FavoriteToggle } from "@/components/roadmap/favorite-toggle";
import {
  ProblemSummaryList,
  type ProblemSummary,
} from "@/components/problems/problem-summary-list";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata = { title: "Favorites — DSA Journey" };

export default async function FavoritesPage() {
  const userId = await requireUserId();

  const [topics, problems] = await Promise.all([
    prisma.topic.findMany({
      where: { userId, favorite: true },
      orderBy: { order: "asc" },
      include: { _count: { select: { problems: true } } },
    }),
    prisma.problem.findMany({
      where: { userId, favorite: true },
      orderBy: { solvedDate: "desc" },
      include: { topic: { select: { slug: true, title: true } } },
    }),
  ]);

  const problemRows: ProblemSummary[] = problems.map((p) => ({
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
  }));

  const empty = topics.length === 0 && problems.length === 0;

  return (
    <div>
      <PageHeader
        icon={Star}
        title="Favorites"
        description="Topics and problems you starred for quick access."
      />

      {empty ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-[var(--muted)]">Nothing starred yet.</p>
          <p className="mt-1 text-xs text-[var(--subtle)]">
            Tap the ☆ on any topic or problem to pin it here.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {topics.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-slate-100">
                Topics{" "}
                <span className="text-[var(--subtle)] tabular-nums">
                  ({topics.length})
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {topics.map((t) => {
                  const meta = phaseMeta(t.phase);
                  const status = TOPIC_STATUS_META[t.status as TopicStatus];
                  return (
                    <Card key={t.id} hover className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-[var(--subtle)]">
                            Phase {t.phase} · {meta.title}
                          </p>
                          <Link
                            href={`/roadmap/${t.slug}`}
                            className="mt-0.5 block truncate text-sm font-medium text-[var(--foreground)] hover:text-blue-300"
                          >
                            {t.title}
                          </Link>
                        </div>
                        <FavoriteToggle id={t.id} favorite={t.favorite} />
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="min-w-0 flex-1">
                          <Progress value={t.progress} color={meta.accent} />
                        </span>
                        <Badge variant={status?.badge}>
                          {status?.emoji} {status?.label}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-[var(--subtle)] tabular-nums">
                        {t._count.problems} problems tracked
                      </p>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {problemRows.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-medium text-slate-100">
                Problems{" "}
                <span className="text-[var(--subtle)] tabular-nums">
                  ({problemRows.length})
                </span>
              </h2>
              <ProblemSummaryList problems={problemRows} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
