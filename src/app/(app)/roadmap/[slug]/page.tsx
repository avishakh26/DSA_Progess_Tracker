import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseResources, phaseMeta } from "@/lib/roadmap-data";
import { StatusSelector } from "@/components/roadmap/status-selector";
import { FavoriteToggle } from "@/components/roadmap/favorite-toggle";
import { ProgressSlider } from "@/components/roadmap/progress-slider";
import { TopicNotes } from "@/components/roadmap/topic-notes";
import { ProblemList } from "@/components/problems/problem-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const userId = await requireUserId();

  const topic = await prisma.topic.findFirst({
    where: { userId, slug },
    include: { problems: { orderBy: { solvedDate: "desc" } } },
  });
  if (!topic) notFound();

  const meta = phaseMeta(topic.phase);
  const resources = parseResources(topic.resources);

  // Previous / next topic in curriculum order, for keyboard-free navigation.
  const [prev, next] = await Promise.all([
    prisma.topic.findFirst({
      where: { userId, order: { lt: topic.order } },
      orderBy: { order: "desc" },
      select: { slug: true, title: true },
    }),
    prisma.topic.findFirst({
      where: { userId, order: { gt: topic.order } },
      orderBy: { order: "asc" },
      select: { slug: true, title: true },
    }),
  ]);

  const solved = topic.problems.filter((p) => p.status === "SOLVED").length;
  const revision = topic.problems.filter((p) => p.status === "REVISION").length;

  return (
    <div className="flex flex-col gap-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2 self-start">
        <Link href="/roadmap">
          <ArrowLeft />
          All phases
        </Link>
      </Button>

      {/* ── Header ──────────────────────────────────────────── */}
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                style={{
                  background: `${meta.accent}1f`,
                  borderColor: `${meta.accent}44`,
                  color: meta.accent,
                }}
              >
                Phase {topic.phase} · {meta.title}
              </Badge>
              {meta.target && (
                <span className="text-xs text-[var(--subtle)]">
                  Target: {meta.target}
                </span>
              )}
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {topic.title}
            </h1>
            {topic.description && (
              <p className="mt-1.5 max-w-2xl text-sm text-[var(--muted)]">
                {topic.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <StatusSelector topicId={topic.id} status={topic.status} />
            <FavoriteToggle
              id={topic.id}
              favorite={topic.favorite}
              className="size-9"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-[var(--muted)] uppercase">
              Progress
            </p>
            <ProgressSlider
              topicId={topic.id}
              value={topic.progress}
              accent={meta.accent}
            />
            <p className="mt-2 text-xs text-[var(--subtle)]">
              {topic.problems.length} problem
              {topic.problems.length === 1 ? "" : "s"} tracked · {solved} solved
              {revision > 0 && ` · ${revision} need revision`}
            </p>
          </div>

          {resources.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wide text-[var(--muted)] uppercase">
                <BookOpen className="size-3.5" />
                Learning resources
              </p>
              <ul className="flex flex-wrap gap-2">
                {resources.map((r) => (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white/[0.04] px-2.5 py-1.5 text-xs text-[var(--foreground)] transition-colors hover:border-[var(--border-strong)] hover:text-blue-300"
                    >
                      {r.label}
                      <ExternalLink className="size-3 text-[var(--subtle)]" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* ── Problems ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Problem tracker</CardTitle>
          <p className="text-sm text-[var(--muted)]">
            Every problem you&apos;ve attempted for this topic — add as many as you
            like.
          </p>
        </CardHeader>
        <CardContent>
          <ProblemList
            topicId={topic.id}
            problems={topic.problems.map((p) => ({
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
            }))}
          />
        </CardContent>
      </Card>

      {/* ── Notes ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Personal notes</CardTitle>
          <p className="text-sm text-[var(--muted)]">
            Markdown with code blocks, tables, checklists and images. Autosaves.
          </p>
        </CardHeader>
        <CardContent>
          <TopicNotes topicId={topic.id} notes={topic.notes} />
        </CardContent>
      </Card>

      {/* ── Prev / next ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {prev ? (
          <Button asChild variant="secondary">
            <Link href={`/roadmap/${prev.slug}`}>
              <ArrowLeft />
              <span className="max-w-48 truncate">{prev.title}</span>
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next && (
          <Button asChild variant="secondary">
            <Link href={`/roadmap/${next.slug}`}>
              <span className="max-w-48 truncate">{next.title}</span>
              <ArrowRight />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
