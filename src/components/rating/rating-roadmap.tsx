"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveRatingNodeNotes, toggleRatingNode } from "@/actions/goals";
import { splitTags } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RatingNodeRow = {
  id: string;
  rating: number;
  title: string;
  focus: string;
  skills: string;
  completed: boolean;
  notes: string | null;
};

/** Rating bands get progressively warmer as the difficulty climbs. */
function bandColor(rating: number) {
  if (rating < 1000) return "#94a3b8"; // newbie grey
  if (rating < 1200) return "#199e70"; // green
  if (rating < 1400) return "#3987e5"; // cyan-ish blue
  if (rating < 1600) return "#9085e9"; // violet
  if (rating < 1800) return "#c98500"; // yellow
  return "#d95926"; // orange
}

export function RatingRoadmap({ nodes }: { nodes: RatingNodeRow[] }) {
  return (
    <div className="relative">
      {/* Connector spine */}
      <span
        aria-hidden
        className="absolute top-8 bottom-8 left-[43px] w-0.5 bg-gradient-to-b from-slate-500/40 via-[var(--primary)]/40 to-orange-500/40 md:left-1/2 md:-translate-x-1/2"
      />

      <ol className="flex flex-col gap-4">
        {nodes.map((node, i) => (
          <RatingNodeCard key={node.id} node={node} index={i} />
        ))}
      </ol>
    </div>
  );
}

function RatingNodeCard({ node, index }: { node: RatingNodeRow; index: number }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(node.notes ?? "");
  const [pending, startTransition] = useTransition();
  const color = bandColor(node.rating);
  const skills = splitTags(node.skills);
  const side = index % 2 === 0 ? "left" : "right";

  const toggle = () => {
    startTransition(async () => {
      const now = await toggleRatingNode(node.id);
      toast.success(now ? `${node.rating} cleared 🎯` : `${node.rating} reopened`);
    });
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        "relative flex items-start gap-4",
        // Alternate sides on wide screens for a genuine node graph feel.
        side === "right" && "md:flex-row-reverse",
      )}
    >
      {/* Rating node */}
      <button
        onClick={toggle}
        disabled={pending}
        title={node.completed ? "Mark as not reached" : "Mark as reached"}
        className={cn(
          "relative z-10 grid size-[86px] shrink-0 place-items-center rounded-2xl border-2 transition-all",
          "md:absolute md:left-1/2 md:-translate-x-1/2",
          node.completed ? "shadow-lg" : "hover:scale-105",
        )}
        style={{
          background: node.completed ? color : `${color}14`,
          borderColor: node.completed ? color : `${color}55`,
          boxShadow: node.completed ? `0 8px 28px -10px ${color}` : undefined,
        }}
      >
        {pending ? (
          <Loader2 className="size-5 animate-spin" style={{ color }} />
        ) : (
          <span className="flex flex-col items-center gap-0.5">
            <span
              className="text-xl font-bold tabular-nums"
              style={{ color: node.completed ? "#0f172a" : color }}
            >
              {node.rating}
            </span>
            {node.completed && (
              <Check className="size-3.5 text-slate-900" strokeWidth={3} />
            )}
          </span>
        )}
      </button>

      {/* Card — sits opposite the node on wide screens */}
      <Card
        hover
        className={cn(
          "min-w-0 flex-1 md:w-[calc(50%-4rem)] md:flex-none",
          side === "left" ? "md:mr-auto" : "md:ml-auto",
        )}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-start gap-3 p-4 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-base font-semibold text-[var(--foreground)]">
                {node.title}
              </span>
              {node.completed && <Badge variant="success">Reached</Badge>}
            </span>
            <span className="mt-0.5 block text-sm text-[var(--muted)]">
              {node.focus}
            </span>
            <span className="mt-2 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  className="rounded-md border px-1.5 py-0.5 text-[0.7rem]"
                  style={{
                    borderColor: `${color}44`,
                    background: `${color}14`,
                    color,
                  }}
                >
                  {s}
                </span>
              ))}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-[var(--subtle)] transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div className="border-t border-[var(--border)] p-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-[var(--muted)] uppercase">
              Notes for this band
            </p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Which problems tripped you up at this rating?"
              className="min-h-24 text-sm"
            />
            <Button
              size="sm"
              variant="secondary"
              className="mt-2"
              disabled={pending || notes === (node.notes ?? "")}
              onClick={() =>
                startTransition(async () => {
                  await saveRatingNodeNotes(node.id, notes);
                  toast.success("Notes saved");
                })
              }
            >
              Save notes
            </Button>
          </div>
        )}
      </Card>
    </motion.li>
  );
}
