"use server";

import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { phaseMeta } from "@/lib/roadmap-data";

export type SearchResult =
  | {
      kind: "topic";
      id: string;
      slug: string;
      title: string;
      phase: number;
      phaseTitle: string;
      status: string;
      progress: number;
    }
  | {
      kind: "problem";
      id: string;
      title: string;
      topicSlug: string;
      topicTitle: string;
      platform: string;
      difficulty: string;
      status: string;
      tags: string;
    };

export type SearchFilters = {
  platform?: string;
  difficulty?: string;
  status?: string;
};

/**
 * Powers the ⌘K palette. SQLite's LIKE is case-insensitive for ASCII, which is
 * why there's no `mode: "insensitive"` here (Prisma rejects it on SQLite).
 */
export async function globalSearch(
  query: string,
  filters: SearchFilters = {},
): Promise<SearchResult[]> {
  const userId = await requireUserId();
  const q = query.trim();
  const hasFilters = Boolean(filters.platform || filters.difficulty || filters.status);

  if (!q && !hasFilters) return [];

  // A topic-status filter and a problem-status filter share one control, so a
  // status like SOLVED simply matches no topics — that's intentional.
  const topics = filters.platform
    ? []
    : await prisma.topic.findMany({
        where: {
          userId,
          ...(q
            ? {
                OR: [
                  { title: { contains: q } },
                  { description: { contains: q } },
                  { notes: { contains: q } },
                ],
              }
            : {}),
          ...(filters.status && ["DONE", "PENDING", "SKIP"].includes(filters.status)
            ? { status: filters.status }
            : {}),
        },
        orderBy: { order: "asc" },
        take: 12,
      });

  const problems = await prisma.problem.findMany({
    where: {
      userId,
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { tags: { contains: q } },
              { notes: { contains: q } },
              { platform: { contains: q } },
            ],
          }
        : {}),
      ...(filters.platform ? { platform: filters.platform } : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
      ...(filters.status &&
      ["SOLVED", "ATTEMPTED", "REVISION"].includes(filters.status)
        ? { status: filters.status }
        : {}),
    },
    include: { topic: { select: { slug: true, title: true } } },
    orderBy: { solvedDate: "desc" },
    take: 24,
  });

  return [
    ...topics.map(
      (t): SearchResult => ({
        kind: "topic",
        id: t.id,
        slug: t.slug,
        title: t.title,
        phase: t.phase,
        phaseTitle: phaseMeta(t.phase).title,
        status: t.status,
        progress: t.progress,
      }),
    ),
    ...problems.map(
      (p): SearchResult => ({
        kind: "problem",
        id: p.id,
        title: p.title,
        topicSlug: p.topic.slug,
        topicTitle: p.topic.title,
        platform: p.platform,
        difficulty: p.difficulty,
        status: p.status,
        tags: p.tags,
      }),
    ),
  ];
}
