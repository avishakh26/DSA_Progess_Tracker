"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Eye, Loader2, Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/notes/markdown";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/input";

const PLACEHOLDER = `# My notes

Supports **markdown** — headings, tables, checklists, images and code:

\`\`\`cpp
int lo = 0, hi = n;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (ok(mid)) hi = mid; else lo = mid + 1;
}
\`\`\`

- [ ] Revisit this next week
`;

/**
 * Write/preview markdown editor with a debounced autosave. `saved` flips back to
 * false on every keystroke so the indicator can't claim "saved" while there are
 * unflushed edits.
 */
export function MarkdownEditor({
  initialValue,
  onSave,
  minHeight = 320,
}: {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  minHeight?: number;
}) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(true);
  const [pending, startTransition] = useTransition();
  const lastSaved = useRef(initialValue);

  const save = (next: string) => {
    if (next === lastSaved.current) {
      setSaved(true);
      return;
    }
    startTransition(async () => {
      await onSave(next);
      lastSaved.current = next;
      setSaved(true);
    });
  };

  // Autosave 1.2s after typing stops.
  useEffect(() => {
    if (value === lastSaved.current) return;
    const timer = setTimeout(() => save(value), 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Tabs defaultValue="write">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="write">
            <Pencil />
            Write
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye />
            Preview
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-[var(--subtle)]">
            {pending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                Saving…
              </>
            ) : saved ? (
              <>
                <Check className="size-3 text-emerald-400" />
                Saved
              </>
            ) : (
              "Unsaved changes"
            )}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={pending || saved}
            onClick={() => {
              save(value);
              toast.success("Notes saved");
            }}
          >
            <Save />
            Save
          </Button>
        </div>
      </div>

      <TabsContent value="write">
        <Textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          className="font-mono text-[0.8125rem] leading-relaxed"
          style={{ minHeight }}
        />
      </TabsContent>

      <TabsContent value="preview">
        <div
          className="rounded-lg border border-[var(--border)] bg-slate-950/30 p-4"
          style={{ minHeight }}
        >
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-sm text-[var(--subtle)]">
              Nothing to preview yet.
            </p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
