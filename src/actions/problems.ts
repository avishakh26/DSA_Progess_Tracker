"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  DIFFICULTIES,
  PLATFORMS,
  PROBLEM_STATUSES,
  joinTags,
  type Difficulty,
  type Platform,
  type ProblemStatus,
} from "@/lib/constants";

export type ProblemInput = {
  title: string;
  platform: string;
  problemLink: string;
  solutionLink: string;
  difficulty: string;
  status: string;
  solvedDate: string; // yyyy-mm-dd
  tags: string; // comma separated
  notes: string;
};

function validate(input: ProblemInput) {
  const title = input.title.trim();
  if (!title) throw new Error("Problem name is required");

  const platform = PLATFORMS.includes(input.platform as Platform)
    ? input.platform
    : "OTHER";
  const difficulty = DIFFICULTIES.includes(input.difficulty as Difficulty)
    ? input.difficulty
    : "EASY";
  const status = PROBLEM_STATUSES.includes(input.status as ProblemStatus)
    ? input.status
    : "SOLVED";

  const parsed = new Date(input.solvedDate);
  const solvedDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;

  return {
    title,
    platform,
    difficulty,
    status,
    solvedDate,
    problemLink: input.problemLink.trim() || null,
    solutionLink: input.solutionLink.trim() || null,
    notes: input.notes.trim() || null,
    tags: joinTags(input.tags.split(",")),
  };
}

function startOfUtcDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Keeps the heatmap in sync. Called with +1 when a problem is added on a day
 * and -1 when one is removed, so the counter never drifts from reality.
 */
async function bumpActivity(userId: string, date: Date, delta: number) {
  const day = startOfUtcDay(date);
  const existing = await prisma.activity.findUnique({
    where: { userId_date: { userId, date: day } },
  });

  if (!existing) {
    if (delta <= 0) return;
    await prisma.activity.create({ data: { userId, date: day, count: delta } });
    return;
  }

  const next = existing.count + delta;
  if (next <= 0) {
    await prisma.activity.delete({ where: { id: existing.id } });
  } else {
    await prisma.activity.update({ where: { id: existing.id }, data: { count: next } });
  }
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function createProblem(topicId: string, input: ProblemInput) {
  const userId = await requireUserId();

  const topic = await prisma.topic.findFirst({
    where: { id: topicId, userId },
    select: { id: true },
  });
  if (!topic) throw new Error("Topic not found");

  const data = validate(input);
  const problem = await prisma.problem.create({
    data: { ...data, userId, topicId },
  });

  await bumpActivity(userId, data.solvedDate, 1);
  revalidateAll();
  return problem.id;
}

export async function updateProblem(problemId: string, input: ProblemInput) {
  const userId = await requireUserId();

  const existing = await prisma.problem.findFirst({
    where: { id: problemId, userId },
    select: { solvedDate: true },
  });
  if (!existing) throw new Error("Problem not found");

  const data = validate(input);
  await prisma.problem.update({ where: { id: problemId }, data });

  // Move the heatmap contribution if the solved date changed.
  const before = startOfUtcDay(existing.solvedDate).getTime();
  const after = startOfUtcDay(data.solvedDate).getTime();
  if (before !== after) {
    await bumpActivity(userId, existing.solvedDate, -1);
    await bumpActivity(userId, data.solvedDate, 1);
  }

  revalidateAll();
}

export async function deleteProblem(problemId: string) {
  const userId = await requireUserId();

  const existing = await prisma.problem.findFirst({
    where: { id: problemId, userId },
    select: { id: true, solvedDate: true },
  });
  if (!existing) throw new Error("Problem not found");

  await prisma.problem.delete({ where: { id: existing.id } });
  await bumpActivity(userId, existing.solvedDate, -1);
  revalidateAll();
}

export async function setProblemStatus(problemId: string, status: string) {
  const userId = await requireUserId();
  if (!PROBLEM_STATUSES.includes(status as ProblemStatus)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const { count } = await prisma.problem.updateMany({
    where: { id: problemId, userId },
    data: { status },
  });
  if (count === 0) throw new Error("Problem not found");
  revalidateAll();
}

export async function toggleProblemFavorite(problemId: string) {
  const userId = await requireUserId();

  const existing = await prisma.problem.findFirst({
    where: { id: problemId, userId },
    select: { id: true, favorite: true },
  });
  if (!existing) throw new Error("Problem not found");

  await prisma.problem.update({
    where: { id: existing.id },
    data: { favorite: !existing.favorite },
  });
  revalidateAll();
  return !existing.favorite;
}
