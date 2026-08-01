"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ExternalLink,
  FileCode2,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { deleteProblem, setProblemStatus } from "@/actions/problems";
import {
  DIFFICULTIES,
  DIFFICULTY_META,
  PLATFORMS,
  PLATFORM_META,
  PROBLEM_STATUSES,
  PROBLEM_STATUS_META,
  platformColor,
  platformLabel,
  splitTags,
  type Difficulty,
  type ProblemStatus,
} from "@/lib/constants";
import { FavoriteToggle } from "@/components/roadmap/favorite-toggle";
import {
  ProblemDialog,
  emptyDraft,
  type ProblemDraft,
} from "@/components/problems/problem-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Markdown } from "@/components/notes/markdown";
import { cn } from "@/lib/utils";

export type ProblemRow = {
  id: string;
  title: string;
  platform: string;
  problemLink: string | null;
  solutionLink: string | null;
  difficulty: string;
  status: string;
  solvedDate: string; // ISO
  tags: string;
  notes: string | null;
  favorite: boolean;
};

export function ProblemList({
  topicId,
  problems,
}: {
  topicId: string;
  problems: ProblemRow[];
}) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<ProblemDraft>(emptyDraft);
  const [expanded, setExpanded] = useState<string | null>(null);

  const hasFilters = Boolean(platform || difficulty || status || query);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((p) => {
      if (platform && p.platform !== platform) return false;
      if (difficulty && p.difficulty !== difficulty) return false;
      if (status && p.status !== status) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.tags.toLowerCase().includes(q) ||
        (p.notes ?? "").toLowerCase().includes(q)
      );
    });
  }, [problems, query, platform, difficulty, status]);

  const openAdd = () => {
    setDraft(emptyDraft());
    setDialogOpen(true);
  };

  const openEdit = (p: ProblemRow) => {
    setDraft({
      id: p.id,
      title: p.title,
      platform: p.platform,
      problemLink: p.problemLink ?? "",
      solutionLink: p.solutionLink ?? "",
      difficulty: p.difficulty,
      status: p.status,
      solvedDate: p.solvedDate.slice(0, 10),
      tags: p.tags,
      notes: p.notes ?? "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--subtle)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter problems…"
            className="pl-9"
          />
        </div>

        <Button
          variant={showFilters || hasFilters ? "secondary" : "ghost"}
          onClick={() => setShowFilters((v) => !v)}
        >
          <Filter />
          Filters
        </Button>

        <Button onClick={openAdd}>
          <Plus />
          Add problem
        </Button>
      </div>

      {(showFilters || hasFilters) && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-white/[0.025] p-2.5">
          <Select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="h-8 w-auto text-xs"
          >
            <option value="">Any platform</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_META[p].label}
              </option>
            ))}
          </Select>

          <Select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="h-8 w-auto text-xs"
          >
            <option value="">Any difficulty</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_META[d].label}
              </option>
            ))}
          </Select>

          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-8 w-auto text-xs"
          >
            <option value="">Any status</option>
            {PROBLEM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {PROBLEM_STATUS_META[s].label}
              </option>
            ))}
          </Select>

          <span className="ml-auto text-xs text-[var(--subtle)] tabular-nums">
            {filtered.length} of {problems.length}
          </span>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setPlatform("");
                setDifficulty("");
                setStatus("");
              }}
            >
              <X />
              Clear
            </Button>
          )}
        </div>
      )}

      {/* ── List ────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-strong)] py-12 text-center">
          <p className="text-sm text-[var(--muted)]">
            {problems.length === 0
              ? "No problems tracked for this topic yet."
              : "No problems match those filters."}
          </p>
          {problems.length === 0 && (
            <Button onClick={openAdd} variant="secondary" className="mt-3">
              <Plus />
              Add the first one
            </Button>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((p) => (
            <ProblemItem
              key={p.id}
              problem={p}
              expanded={expanded === p.id}
              onToggleExpand={() =>
                setExpanded((id) => (id === p.id ? null : p.id))
              }
              onEdit={() => openEdit(p)}
            />
          ))}
        </ul>
      )}

      <ProblemDialog
        topicId={topicId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        draft={draft}
      />
    </div>
  );
}

function ProblemItem({
  problem: p,
  expanded,
  onToggleExpand,
  onEdit,
}: {
  problem: ProblemRow;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const tags = splitTags(p.tags);

  const remove = () => {
    startTransition(async () => {
      try {
        await deleteProblem(p.id);
        toast.success("Problem deleted");
      } catch {
        toast.error("Could not delete that problem");
      }
    });
  };

  const changeStatus = (next: string) => {
    startTransition(async () => {
      await setProblemStatus(p.id, next);
      toast.success(
        `Marked ${PROBLEM_STATUS_META[next as ProblemStatus].label.toLowerCase()}`,
      );
    });
  };

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
          title={platformLabel(p.platform)}
        />

        <div className="min-w-0 flex-1 basis-56">
          <button
            onClick={onToggleExpand}
            className="block max-w-full truncate text-left text-sm font-medium text-[var(--foreground)] hover:text-blue-300"
          >
            {p.title}
          </button>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-[var(--subtle)]">
            <span>{platformLabel(p.platform)}</span>
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
        <Badge variant={PROBLEM_STATUS_META[p.status as ProblemStatus]?.badge}>
          {PROBLEM_STATUS_META[p.status as ProblemStatus]?.label ?? p.status}
        </Badge>

        <div className="flex shrink-0 items-center gap-0.5">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="grid size-7 place-items-center rounded-md text-[var(--subtle)] transition-colors hover:bg-white/[0.07] hover:text-[var(--foreground)]"
                aria-label="More actions"
              >
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Set status</DropdownMenuLabel>
              {PROBLEM_STATUSES.filter((s) => s !== p.status).map((s) => (
                <DropdownMenuItem key={s} onSelect={() => changeStatus(s)}>
                  <span
                    className="size-2 rounded-full"
                    style={{ background: PROBLEM_STATUS_META[s].color }}
                  />
                  {PROBLEM_STATUS_META[s].label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={remove}
                className="text-rose-300 [&_svg]:text-rose-300"
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--border)] px-3 py-3">
          {p.notes?.trim() ? (
            <Markdown>{p.notes}</Markdown>
          ) : (
            <p className="text-sm text-[var(--subtle)]">
              No notes on this problem.{" "}
              <button onClick={onEdit} className="text-[var(--primary)] hover:underline">
                Add some
              </button>
              .
            </p>
          )}
        </div>
      )}
    </li>
  );
}
