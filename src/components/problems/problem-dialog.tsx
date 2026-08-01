"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  createProblem,
  updateProblem,
  type ProblemInput,
} from "@/actions/problems";
import {
  DIFFICULTIES,
  DIFFICULTY_META,
  PLATFORMS,
  PLATFORM_META,
  PROBLEM_STATUSES,
  PROBLEM_STATUS_META,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

export type ProblemDraft = ProblemInput & { id?: string };

export const emptyDraft = (): ProblemDraft => ({
  title: "",
  platform: "CODEFORCES",
  problemLink: "",
  solutionLink: "",
  difficulty: "EASY",
  status: "SOLVED",
  solvedDate: new Date().toISOString().slice(0, 10),
  tags: "",
  notes: "",
});

export function ProblemDialog({
  topicId,
  open,
  onOpenChange,
  draft,
}: {
  topicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: ProblemDraft;
}) {
  const [form, setForm] = useState(draft);
  const [pending, startTransition] = useTransition();
  const editing = Boolean(draft.id);

  // Re-seed the form whenever a different problem is opened.
  const [seed, setSeed] = useState(draft);
  if (seed !== draft) {
    setSeed(draft);
    setForm(draft);
  }

  const set = <K extends keyof ProblemDraft>(key: K, value: ProblemDraft[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.title.trim()) {
      toast.error("Give the problem a name first.");
      return;
    }

    startTransition(async () => {
      try {
        if (draft.id) {
          await updateProblem(draft.id, form);
          toast.success("Problem updated");
        } else {
          await createProblem(topicId, form);
          toast.success("Problem added");
        }
        onOpenChange(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit problem" : "Add problem"}</DialogTitle>
          <DialogDescription>
            Track where it came from, how hard it was, and what you learned.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-title">Problem name *</Label>
            <Input
              id="p-title"
              autoFocus
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Watermelon"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-platform">Platform</Label>
              <Select
                id="p-platform"
                value={form.platform}
                onChange={(e) => set("platform", e.target.value)}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_META[p].label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-difficulty">Difficulty</Label>
              <Select
                id="p-difficulty"
                value={form.difficulty}
                onChange={(e) => set("difficulty", e.target.value)}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_META[d].label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-status">Status</Label>
              <Select
                id="p-status"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {PROBLEM_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {PROBLEM_STATUS_META[s].label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-link">Problem link</Label>
            <Input
              id="p-link"
              type="url"
              value={form.problemLink}
              onChange={(e) => set("problemLink", e.target.value)}
              placeholder="https://codeforces.com/problemset/problem/4/A"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-solution">Solution link</Label>
            <Input
              id="p-solution"
              type="url"
              value={form.solutionLink}
              onChange={(e) => set("solutionLink", e.target.value)}
              placeholder="https://github.com/you/cp/blob/main/4A.cpp"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-date">Date solved</Label>
              <Input
                id="p-date"
                type="date"
                value={form.solvedDate}
                onChange={(e) => set("solvedDate", e.target.value)}
                className="[&::-webkit-calendar-picker-indicator]:invert-[0.6]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-tags">Tags</Label>
              <Input
                id="p-tags"
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="greedy, sorting, implementation"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-notes">Notes</Label>
            <Textarea
              id="p-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="What was the trick? What did you get wrong first?"
              className="min-h-24"
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Save />}
            {editing ? "Save changes" : "Add problem"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
