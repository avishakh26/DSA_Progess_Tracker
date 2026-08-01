import { TrendingUp } from "lucide-react";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { RatingRoadmap } from "@/components/rating/rating-roadmap";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata = { title: "Codeforces Rating Roadmap — DSA Journey" };

export default async function RatingPage() {
  const userId = await requireUserId();

  const [nodes, user] = await Promise.all([
    prisma.ratingNode.findMany({ where: { userId }, orderBy: { order: "asc" } }),
    prisma.user.findUnique({ where: { id: userId }, select: { handleCf: true } }),
  ]);

  const cleared = nodes.filter((n) => n.completed);
  const percent =
    nodes.length > 0 ? Math.round((cleared.length / nodes.length) * 100) : 0;
  const currentBand = cleared.at(-1)?.rating ?? null;
  const nextBand = nodes.find((n) => !n.completed)?.rating ?? null;

  return (
    <div>
      <PageHeader
        icon={TrendingUp}
        title="Codeforces Rating Roadmap"
        description="What to master at each rating band, from 800 up to 1800+. Click a node when you clear it."
      />

      <Card className="mb-8 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--muted)]">
              {currentBand
                ? `Cleared through ${currentBand}`
                : "No bands cleared yet"}
              {user?.handleCf && (
                <span className="text-[var(--subtle)]"> · @{user.handleCf}</span>
              )}
            </p>
            {nextBand && (
              <p className="mt-0.5 text-sm text-blue-300">
                Next up: {nextBand}
              </p>
            )}
          </div>
          <p className="text-sm text-slate-100 tabular-nums">
            <span className="text-lg font-semibold">{cleared.length}</span>
            <span className="text-[var(--muted)]"> / {nodes.length} bands</span>
          </p>
        </div>
        <Progress value={percent} className="mt-3 h-2" />
      </Card>

      <RatingRoadmap
        nodes={nodes.map((n) => ({
          id: n.id,
          rating: n.rating,
          title: n.title,
          focus: n.focus,
          skills: n.skills,
          completed: n.completed,
          notes: n.notes,
        }))}
      />
    </div>
  );
}
