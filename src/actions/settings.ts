"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfile(input: {
  name: string;
  dailyGoal: number;
  handleCf: string;
  handleLc: string;
}) {
  const userId = await requireUserId();

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name.trim() || null,
      dailyGoal: Math.max(1, Math.min(50, Math.round(input.dailyGoal) || 1)),
      handleCf: input.handleCf.trim() || null,
      handleLc: input.handleLc.trim() || null,
    },
  });
  revalidatePath("/", "layout");
}

/** Wipes all tracked progress but keeps the account and the curriculum rows. */
export async function resetProgress() {
  const userId = await requireUserId();

  await prisma.$transaction([
    prisma.problem.deleteMany({ where: { userId } }),
    prisma.activity.deleteMany({ where: { userId } }),
    prisma.topic.updateMany({
      where: { userId },
      data: { status: "PENDING", progress: 0, favorite: false, notes: null },
    }),
    prisma.monthlyGoal.updateMany({
      where: { userId },
      data: { progress: 0, completed: false },
    }),
    prisma.ratingNode.updateMany({
      where: { userId },
      data: { completed: false, notes: null },
    }),
  ]);
  revalidatePath("/", "layout");
}
