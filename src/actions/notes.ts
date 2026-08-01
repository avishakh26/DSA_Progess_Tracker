"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createNote(title: string, content = "") {
  const userId = await requireUserId();
  const note = await prisma.note.create({
    data: { userId, title: title.trim() || "Untitled note", content },
  });
  revalidatePath("/notes");
  return note.id;
}

export async function updateNote(noteId: string, title: string, content: string) {
  const userId = await requireUserId();
  const { count } = await prisma.note.updateMany({
    where: { id: noteId, userId },
    data: { title: title.trim() || "Untitled note", content },
  });
  if (count === 0) throw new Error("Note not found");
  revalidatePath("/notes");
}

export async function deleteNote(noteId: string) {
  const userId = await requireUserId();
  const { count } = await prisma.note.deleteMany({ where: { id: noteId, userId } });
  if (count === 0) throw new Error("Note not found");
  revalidatePath("/notes");
}

export async function toggleNotePinned(noteId: string) {
  const userId = await requireUserId();
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId },
    select: { id: true, pinned: true },
  });
  if (!note) throw new Error("Note not found");

  await prisma.note.update({
    where: { id: note.id },
    data: { pinned: !note.pinned },
  });
  revalidatePath("/notes");
  return !note.pinned;
}
