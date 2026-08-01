"use client";

import { useTransition } from "react";
import Link from "next/link";
import { CheckCheck, ExternalLink, FileCode2 } from "lucide-react";
import { toast } from "sonner";
import { setProblemStatus } from "@/actions/problems";
import {
  DIFFICULTY_META,
  PROBLEM_STATUS_META,
  platformColor,
  platformLabel,
  splitTags,
  type Difficulty,
  type ProblemStatus,
} from "@/lib/constants";
import { FavoriteToggle } from "@/components/roadmap/favorite-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/notes/markdown";
import { cn } from "@/lib/utils";

export type ProblemSummary = {
  id: string;
  title: string;
  platform: string;
  problemLink: string | null;
  solutionLink: string | null;
  difficulty: string;
  status: string;
  solvedDate: string;
  tags: string;
  notes: string | null;
  favorite: boolean;
  topicSlug: string;
  topicTitle: string;
};

/**
 * Read-mostly problem list used by the aggregate pages (Revision, Favorites).
 * Editing happens on the topic page — this view offers only the one action each
 * page actually needs.
 */
export function ProblemSummaryList({
  problems,
  showResolve = false,
}: {
  problems: ProblemSummary[];
  showResolve?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {problems.map((p) => (
        <ProblemSummaryItem key={p.id} problem={p} showResolve={showResolve} />
      ))}
    </ul>
  );
}

function ProblemSummaryItem({
  problem: p,
  showResolve,
}: {
  problem: ProblemSummary;
  showResolve: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const tags = splitTags(p.tags);

  return (
    <li
      className={cn(
        "rounded-xl border border-[var(--border)] bg-white/[0.025] transition-colors hover:border-[var(--border-strong)]",
        pending && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ background: platformColor(p.platform) }}
        />

        <div className="min-w-0 flex-1 basis-56">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">
            {p.title}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-[var(--subtle)]">
            <span>{platformLabel(p.platform)}</span>
            <span>·</span>
            <Link
              href={`/roadmap/${p.topicSlug}`}
              className="truncate hover:text-blue-300"
            >
              {p.topicTitle}
            </Link>
            <span>·</span>
            <span className="tabular-nums">
              {new Date(p.solvedDate).toLocaleDateString("en", {
                year: "numeric",
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              })}
            </span>
            {tags.length > 0 && (
              <>
                <span>·</span>
                <span className="truncate">{tags.join(", ")}</span>
              </>
            )}
          </p>
        </div>

        <Badge variant={DIFFICULTY_META[p.difficulty as Difficulty]?.badge}>
          {DIFFICULTY_META[p.difficulty as Difficulty]?.label ?? p.difficulty}
        </Badge>
        {!showResolve && (
          <Badge variant={PROBLEM_STATUS_META[p.status as ProblemStatus]?.badge}>
            {PROBLEM_STATUS_META[p.status as ProblemStatus]?.label ?? p.status}
          </Badge>
        )}

        <div className="flex shrink-0 items-center gap-0.5">
          {showResolve && (
            <Button
              size="sm"
              variant="success"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await setProblemStatus(p.id, "SOLVED");
                  toast.success("Marked solved — off the revision list");
                })
              }
            >
              <CheckCheck />
              Revised
            </Button>
          )}
          {p.problemLink && (
            <a
              href={p.problemLink}
              target="_blank"
              rel="noreferrer noopener"
              title="Open problem"
              className="grid size-7 place-items-center rounded-md text-[var(--subtle)] transition-colors hover:bg-white/[0.07] hover:text-[var(--foreground)]"
            >
              <ExternalLink className="size-4" />
            </a>
          )}
          {p.solutionLink && (
            <a
              href={p.solutionLink}
              target="_blank"
              rel="noreferrer noopener"
              title="Open solution"
              className="grid size-7 place-items-center rounded-md text-[var(--subtle)] transition-colors hover:bg-white/[0.07] hover:text-[var(--foreground)]"
            >
              <FileCode2 className="size-4" />
            </a>
          )}
          <FavoriteToggle id={p.id} favorite={p.favorite} kind="problem" />
        </div>
      </div>

      {p.notes?.trim() && (
        <div className="border-t border-[var(--border)] px-3 py-2.5">
          <Markdown className="text-[0.8125rem]">{p.notes}</Markdown>
        </div>
      )}
    </li>
  );
}
