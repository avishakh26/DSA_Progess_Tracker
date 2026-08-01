"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TOPIC_STATUSES, type TopicStatus } from "@/lib/constants";

/** Every mutation re-validates the pages whose numbers could have moved. */
function revalidateAll() {
  revalidatePath("/", "layout");
}

/** Ownership check baked into the where-clause: a wrong userId matches 0 rows. */
async function ownedTopic(topicId: string) {
  const userId = await requireUserId();
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, userId },
    select: { id: true },
  });
  if (!topic) throw new Error("Topic not found");
  return userId;
}

export async function setTopicStatus(topicId: string, status: string) {
  await ownedTopic(topicId);
  if (!TOPIC_STATUSES.includes(status as TopicStatus)) {
    throw new Error(`Invalid status: ${status}`);
  }

  await prisma.topic.update({
    where: { id: topicId },
    data: {
      status,
      // Marking a topic done fills the bar; un-marking leaves progress alone so
      // a mis-click doesn't wipe a manually set value.
      ...(status === "DONE" ? { progress: 100 } : {}),
    },
  });
  revalidateAll();
}

export async function setTopicProgress(topicId: string, progress: number) {
  await ownedTopic(topicId);
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  await prisma.topic.update({
    where: { id: topicId },
    data: {
      progress: clamped,
      ...(clamped === 100 ? { status: "DONE" } : {}),
    },
  });
  revalidateAll();
}

export async function toggleTopicFavorite(topicId: string) {
  await ownedTopic(topicId);
  const topic = await prisma.topic.findUniqueOrThrow({
    where: { id: topicId },
    select: { favorite: true },
  });

  await prisma.topic.update({
    where: { id: topicId },
    data: { favorite: !topic.favorite },
  });
  revalidateAll();
  return !topic.favorite;
}

export async function saveTopicNotes(topicId: string, notes: string) {
  await ownedTopic(topicId);
  await prisma.topic.update({
    where: { id: topicId },
    data: { notes: notes.trim() || null },
  });
  revalidatePath("/notes");
  revalidatePath(`/roadmap`);
}
