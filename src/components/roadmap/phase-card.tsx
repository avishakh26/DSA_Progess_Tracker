"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ExternalLink, Target } from "lucide-react";
import { StatusSelector } from "@/components/roadmap/status-selector";
import { FavoriteToggle } from "@/components/roadmap/favorite-toggle";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type PhaseTopic = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  favorite: boolean;
  problemCount: number;
};

export type PhaseCardData = {
  phase: number;
  title: string;
  subtitle: string;
  target: string | null;
  accent: string;
  topics: PhaseTopic[];
  done: number;
  percent: number;
};

export function PhaseCard({
  data,
  defaultOpen = false,
}: {
  data: PhaseCardData;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const totalProblems = data.topics.reduce((n, t) => n + t.problemCount, 0);

  return (
    <Card hover className="overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        {/* Phase number in an accent ring */}
        <span
          className="relative grid size-11 shrink-0 place-items-center rounded-xl text-sm font-semibold"
          style={{
            background: `${data.accent}1f`,
            border: `1px solid ${data.accent}44`,
            color: data.accent,
          }}
        >
          {data.phase}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-[var(--foreground)]">
              {data.title}
            </span>
            {data.percent === 100 && (
              <Badge variant="success">Complete</Badge>
            )}
          </span>
          <span className="mt-0.5 block truncate text-sm text-[var(--muted)]">
            {data.subtitle}
          </span>

          <span className="mt-2.5 flex items-center gap-3">
            <span className="min-w-0 flex-1">
              <Progress value={data.percent} color={data.accent} />
            </span>
            <span className="shrink-0 text-xs text-[var(--muted)] tabular-nums">
              {data.done}/{data.topics.length} topics
            </span>
          </span>
        </span>

        <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          {data.target && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--subtle)]">
              <Target className="size-3.5" />
              {data.target}
            </span>
          )}
          <span className="text-xs text-[var(--subtle)] tabular-nums">
            {totalProblems} problems logged
          </span>
        </span>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[var(--subtle)] transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <ul className="flex flex-col gap-2 border-t border-[var(--border)] p-3">
              {data.topics.map((topic) => (
                <li
                  key={topic.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-white/[0.025] p-3 transition-colors hover:border-[var(--border-strong)]"
                >
                  <div className="min-w-0 flex-1 basis-64">
                    <Link
                      href={`/roadmap/${topic.slug}`}
                      className="group flex items-center gap-1.5"
                    >
                      <span className="truncate text-sm font-medium text-[var(--foreground)] group-hover:text-blue-300">
                        {topic.title}
                      </span>
                      <ExternalLink className="size-3 shrink-0 text-[var(--subtle)] opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                    {topic.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-[var(--subtle)]">
                        {topic.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="min-w-0 flex-1 max-w-48">
                        <Progress value={topic.progress} color={data.accent} />
                      </span>
                      <span className="text-[0.7rem] text-[var(--subtle)] tabular-nums">
                        {topic.progress}%
                      </span>
                      {topic.problemCount > 0 && (
                        <span className="text-[0.7rem] text-[var(--subtle)] tabular-nums">
                          · {topic.problemCount} problems
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <StatusSelector
                      topicId={topic.id}
                      status={topic.status}
                      size="sm"
                    />
                    <FavoriteToggle id={topic.id} favorite={topic.favorite} />
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
