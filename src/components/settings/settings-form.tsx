"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, RotateCcw, Save, ExternalLink } from "lucide-react";
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
    image: string | null;
  };
}) {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    dailyGoal: number;
    handleCf: string;
    handleLc: string;
    image: string | null;
  }>(profile);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        set("image", result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <p className="text-sm text-[var(--muted)]">
            Shown in the top bar and used to greet you on the dashboard.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              {form.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image}
                  alt="Profile"
                  className="size-20 rounded-full object-cover shadow-sm ring-1 ring-[var(--border)]"
                />
              ) : (
                <div className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-2xl font-semibold text-white shadow-sm ring-1 ring-[var(--border)]">
                  {(form.name || form.email)[0]?.toUpperCase()}
                </div>
              )}
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-xs font-medium text-white">Change</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <Label htmlFor="s-name">Display name</Label>
              <Input
                id="s-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your name"
              />
            </div>
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
              <div className="flex gap-2">
                <Input
                  id="s-cf"
                  value={form.handleCf}
                  onChange={(e) => set("handleCf", e.target.value)}
                  placeholder="tourist"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="shrink-0 disabled:opacity-50"
                >
                  {form.handleCf ? (
                    <a
                      href={`https://codeforces.com/profile/${form.handleCf}`}
                      target="_blank"
                      rel="noreferrer"
                      title="View Codeforces Profile"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  ) : (
                    <span title="Enter a handle first">
                      <ExternalLink className="size-4 opacity-50" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-lc">LeetCode handle</Label>
              <div className="flex gap-2">
                <Input
                  id="s-lc"
                  value={form.handleLc}
                  onChange={(e) => set("handleLc", e.target.value)}
                  placeholder="your-handle"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="shrink-0 disabled:opacity-50"
                >
                  {form.handleLc ? (
                    <a
                      href={`https://leetcode.com/u/${form.handleLc}`}
                      target="_blank"
                      rel="noreferrer"
                      title="View LeetCode Profile"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  ) : (
                    <span title="Enter a handle first">
                      <ExternalLink className="size-4 opacity-50" />
                    </span>
                  )}
                </Button>
              </div>
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
    </div>
  );
}

export function SettingsDangerZone() {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  return (
    <>
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
    </>
  );
}
