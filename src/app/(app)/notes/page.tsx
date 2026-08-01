import { StickyNote } from "lucide-react";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { NotesWorkspace } from "@/components/notes/notes-workspace";

export const metadata = { title: "Notes — DSA Journey" };

export default async function NotesPage() {
  const userId = await requireUserId();

  const [notes, topics] = await Promise.all([
    prisma.note.findMany({
      where: { userId },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.topic.findMany({
      where: { userId, NOT: { notes: null } },
      orderBy: { order: "asc" },
      select: { id: true, slug: true, title: true, phase: true, notes: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        icon={StickyNote}
        title="Notes"
        description="Free-standing notes plus every note you've attached to a topic, in one place."
      />

      <NotesWorkspace
        notes={notes.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          pinned: n.pinned,
          updatedAt: n.updatedAt.toISOString(),
        }))}
        topicNotes={topics
          .filter((t) => (t.notes ?? "").trim().length > 0)
          .map((t) => ({
            topicId: t.id,
            slug: t.slug,
            title: t.title,
            phase: t.phase,
            notes: t.notes ?? "",
          }))}
      />
    </div>
  );
}
