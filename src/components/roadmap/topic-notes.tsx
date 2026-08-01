"use client";

import { saveTopicNotes } from "@/actions/topics";
import { MarkdownEditor } from "@/components/notes/markdown-editor";

export function TopicNotes({
  topicId,
  notes,
}: {
  topicId: string;
  notes: string | null;
}) {
  return (
    <MarkdownEditor
      initialValue={notes ?? ""}
      onSave={async (value) => {
        await saveTopicNotes(topicId, value);
      }}
    />
  );
}
