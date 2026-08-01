"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function setGoalProgress(goalId: string, progress: number) {
  const userId = await requireUserId();
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  const { count } = await prisma.monthlyGoal.updateMany({
    where: { id: goalId, userId },
    data: { progress: clamped, completed: clamped >= 100 },
  });
  if (count === 0) throw new Error("Goal not found");
  revalidatePath("/goals");
  revalidatePath("/");
}

export async function toggleGoalCompleted(goalId: string) {
  const userId = await requireUserId();

  const goal = await prisma.monthlyGoal.findFirst({
    where: { id: goalId, userId },
    select: { id: true, completed: true },
  });
  if (!goal) throw new Error("Goal not found");

  await prisma.monthlyGoal.update({
    where: { id: goal.id },
    data: {
      completed: !goal.completed,
      ...(goal.completed ? {} : { progress: 100 }),
    },
  });
  revalidatePath("/goals");
  revalidatePath("/");
  return !goal.completed;
}

export async function toggleRatingNode(nodeId: string) {
  const userId = await requireUserId();

  const node = await prisma.ratingNode.findFirst({
    where: { id: nodeId, userId },
    select: { id: true, completed: true },
  });
  if (!node) throw new Error("Rating node not found");

  await prisma.ratingNode.update({
    where: { id: node.id },
    data: { completed: !node.completed },
  });
  revalidatePath("/rating");
  return !node.completed;
}

export async function saveRatingNodeNotes(nodeId: string, notes: string) {
  const userId = await requireUserId();

  const { count } = await prisma.ratingNode.updateMany({
    where: { id: nodeId, userId },
    data: { notes: notes.trim() || null },
  });
  if (count === 0) throw new Error("Rating node not found");
  revalidatePath("/rating");
}
