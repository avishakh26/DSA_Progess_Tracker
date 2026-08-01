"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { resetProgress, updateProfile } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SettingsForm({
  profile,
}: {
  profile: {
    name: string;
    email: string;
    dailyGoal: number;
    handleCf: string;
    handleLc: string;
  };
}) {
  const [form, setForm] = useState(profile);
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <p className="text-sm text-[var(--muted)]">
            Shown in the top bar and used to greet you on the dashboard.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-name">Display name</Label>
            <Input
              id="s-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-email">Email</Label>
            <Input id="s-email" value={form.email} disabled />
            <p className="text-xs text-[var(--subtle)]">
              Email is your sign-in identity and can&apos;t be changed here.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-goal">Daily problem goal</Label>
            <Input
              id="s-goal"
              type="number"
              min={1}
              max={50}
              value={form.dailyGoal}
              onChange={(e) => set("dailyGoal", Number(e.target.value))}
              className="max-w-32"
            />
            <p className="text-xs text-[var(--subtle)]">
              Drives the &ldquo;Today&apos;s goal&rdquo; card on the dashboard.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-cf">Codeforces handle</Label>
              <Input
                id="s-cf"
                value={form.handleCf}
                onChange={(e) => set("handleCf", e.target.value)}
                placeholder="tourist"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-lc">LeetCode handle</Label>
              <Input
                id="s-lc"
                value={form.handleLc}
                onChange={(e) => set("handleLc", e.target.value)}
                placeholder="your-handle"
              />
            </div>
          </div>

          <Button
            className="self-start"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await updateProfile(form);
                toast.success("Settings saved");
              })
            }
          >
            {pending ? <Loader2 className="animate-spin" /> : <Save />}
            Save changes
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[var(--danger)]/25">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-300">
            <AlertTriangle className="size-4" />
            Danger zone
          </CardTitle>
          <p className="text-sm text-[var(--muted)]">
            Resetting deletes every problem and activity record and clears all
            topic, goal and rating progress. The 14-phase curriculum itself stays.
          </p>
        </CardHeader>
        <CardContent>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            <RotateCcw />
            Reset all progress
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="w-[min(92vw,28rem)]">
          <DialogHeader>
            <DialogTitle>Reset all progress?</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-3">
            <p className="text-sm text-[var(--muted)]">
              This permanently deletes your problems, streak history and every
              status you&apos;ve set. It cannot be undone.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-confirm">
                Type <span className="font-mono text-rose-300">RESET</span> to
                confirm
              </Label>
              <Input
                id="s-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="RESET"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={confirmText !== "RESET" || pending}
              onClick={() =>
                startTransition(async () => {
                  await resetProgress();
                  setConfirmOpen(false);
                  setConfirmText("");
                  toast.success("Progress reset");
                })
              }
            >
              {pending ? <Loader2 className="animate-spin" /> : <RotateCcw />}
              Reset everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
