"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { FileText, Pin, Plus, Route, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createNote,
  deleteNote,
  toggleNotePinned,
  updateNote,
} from "@/actions/notes";
import { MarkdownEditor } from "@/components/notes/markdown-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type StandaloneNote = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  updatedAt: string;
};

export type TopicNote = {
  topicId: string;
  slug: string;
  title: string;
  phase: number;
  notes: string;
};

export function NotesWorkspace({
  notes,
  topicNotes,
}: {
  notes: StandaloneNote[];
  topicNotes: TopicNote[];
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    notes[0]?.id ?? null,
  );
  const [, startTransition] = useTransition();

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
    );
  }, [notes, query]);

  const filteredTopicNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topicNotes;
    return topicNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.notes.toLowerCase().includes(q),
    );
  }, [topicNotes, query]);

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  const addNote = () => {
    startTransition(async () => {
      const id = await createNote("Untitled note");
      setSelectedId(id);
      toast.success("Note created");
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
      {/* ── Sidebar list ────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--subtle)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes…"
              className="pl-9"
            />
          </div>
          <Button onClick={addNote} size="icon" aria-label="New note">
            <Plus />
          </Button>
        </div>

        <Card className="max-h-[70vh] overflow-y-auto p-2">
          <p className="px-2 py-1.5 text-[0.7rem] font-medium tracking-wide text-[var(--subtle)] uppercase">
            My notes ({filteredNotes.length})
          </p>
          {filteredNotes.length === 0 ? (
            <p className="px-2 py-3 text-xs text-[var(--subtle)]">
              {query ? "No matches." : "No notes yet."}
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {filteredNotes.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => setSelectedId(n.id)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors",
                      selectedId === n.id
                        ? "bg-[var(--primary-soft)] text-blue-300"
                        : "text-[var(--muted)] hover:bg-white/[0.06]",
                    )}
                  >
                    <FileText className="mt-0.5 size-3.5 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{n.title}</span>
                      <span className="block truncate text-[0.7rem] text-[var(--subtle)]">
                        {n.content.replace(/[#*`>\-\[\]]/g, "").slice(0, 48) ||
                          "Empty"}
                      </span>
                    </span>
                    {n.pinned && (
                      <Pin className="size-3 shrink-0 fill-current text-amber-400" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-3 border-t border-[var(--border)] px-2 pt-3 pb-1.5 text-[0.7rem] font-medium tracking-wide text-[var(--subtle)] uppercase">
            Topic notes ({filteredTopicNotes.length})
          </p>
          {filteredTopicNotes.length === 0 ? (
            <p className="px-2 py-2 text-xs text-[var(--subtle)]">
              {query ? "No matches." : "None written yet."}
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {filteredTopicNotes.map((n) => (
                <li key={n.topicId}>
                  <Link
                    href={`/roadmap/${n.slug}`}
                    className="flex items-start gap-2 rounded-lg px-2 py-2 text-[var(--muted)] transition-colors hover:bg-white/[0.06]"
                  >
                    <Route className="mt-0.5 size-3.5 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{n.title}</span>
                      <span className="block truncate text-[0.7rem] text-[var(--subtle)]">
                        Phase {n.phase}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* ── Editor ──────────────────────────────────────────── */}
      {selected ? (
        <NoteEditor
          key={selected.id}
          note={selected}
          onDeleted={() => setSelectedId(null)}
        />
      ) : (
        <Card className="grid place-items-center p-12 text-center">
          <div>
            <p className="text-sm text-[var(--muted)]">No note selected.</p>
            <Button onClick={addNote} variant="secondary" className="mt-3">
              <Plus />
              New note
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function NoteEditor({
  note,
  onDeleted,
}: {
  note: StandaloneNote;
  onDeleted: () => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [, startTransition] = useTransition();

  return (
    <Card className="flex flex-col p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title !== note.title) {
              startTransition(async () => {
                await updateNote(note.id, title, note.content);
              });
            }
          }}
          className="h-10 flex-1 border-transparent bg-transparent px-0 text-lg font-semibold hover:border-transparent focus:border-transparent focus:ring-0"
          placeholder="Note title"
        />

        <Button
          variant="ghost"
          size="icon"
          title={note.pinned ? "Unpin" : "Pin"}
          onClick={() =>
            startTransition(async () => {
              const now = await toggleNotePinned(note.id);
              toast.success(now ? "Pinned" : "Unpinned");
            })
          }
          className={note.pinned ? "text-amber-400" : undefined}
        >
          <Pin className={note.pinned ? "fill-current" : undefined} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title="Delete note"
          onClick={() =>
            startTransition(async () => {
              await deleteNote(note.id);
              onDeleted();
              toast.success("Note deleted");
            })
          }
          className="text-rose-300 hover:bg-rose-500/10"
        >
          <Trash2 />
        </Button>
      </div>

      <MarkdownEditor
        initialValue={note.content}
        minHeight={420}
        onSave={async (value) => {
          await updateNote(note.id, title, value);
        }}
      />
    </Card>
  );
}
