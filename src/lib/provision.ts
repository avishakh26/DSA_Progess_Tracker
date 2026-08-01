import { prisma } from "@/lib/prisma";
import { MONTHLY_GOALS, RATING_NODES, TOPICS } from "@/lib/roadmap-data";

/**
 * Copies the static curriculum into a freshly created account. Called once from
 * the signup action — every row is then independently editable by that user.
 */
export async function provisionUser(userId: string) {
  await prisma.topic.createMany({
    data: TOPICS.map((t, index) => ({
      userId,
      slug: t.slug,
      title: t.title,
      phase: t.phase,
      description: t.description,
      resources: t.resources,
      order: index,
    })),
  });

  await prisma.monthlyGoal.createMany({
    data: MONTHLY_GOALS.map((g) => ({
      userId,
      month: g.month,
      title: g.title,
      focus: g.focus,
      description: g.description,
      target: g.target,
    })),
  });

  await prisma.ratingNode.createMany({
    data: RATING_NODES.map((n, index) => ({
      userId,
      rating: n.rating,
      title: n.title,
      focus: n.focus,
      skills: n.skills,
      order: index,
    })),
  });
}
