"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Route, Search, SlidersHorizontal, X } from "lucide-react";
import { globalSearch, type SearchResult } from "@/actions/search";
import {
  DIFFICULTIES,
  DIFFICULTY_META,
  PLATFORMS,
  PLATFORM_META,
  PROBLEM_STATUS_META,
  TOPIC_STATUS_META,
  platformLabel,
  splitTags,
  type Difficulty,
  type ProblemStatus,
  type TopicStatus,
} from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "SOLVED", label: "Solved" },
  { value: "ATTEMPTED", label: "Attempted" },
  { value: "REVISION", label: "Revision needed" },
  { value: "DONE", label: "Topic: done" },
  { value: "PENDING", label: "Topic: pending" },
  { value: "SKIP", label: "Topic: skipped" },
];

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [pending, startTransition] = useTransition();

  const hasFilters = Boolean(platform || difficulty || status);

  const active = Boolean(query.trim()) || hasFilters;
  // An empty query renders nothing regardless of what the last search returned,
  // so there's no need to clear `results` when the input empties.
  const shown = active ? results : [];

  // Debounced search — 220ms is long enough to skip most intermediate keystrokes
  // without the list feeling laggy.
  useEffect(() => {
    if (!open || !active) return;

    const timer = setTimeout(() => {
      startTransition(async () => {
        setResults(await globalSearch(query, { platform, difficulty, status }));
      });
    }, 220);

    return () => clearTimeout(timer);
  }, [query, platform, difficulty, status, open, active]);

  // Reset when the palette closes so it always opens fresh. Derived during
  // render rather than in an effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) setQuery("");
  }

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] max-h-[76vh] translate-y-0 p-0">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4">
          {pending ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-[var(--primary)]" />
          ) : (
            <Search className="size-4 shrink-0 text-[var(--subtle)]" />
          )}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, problems, platforms, tags…"
            className="h-12 flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--subtle)]"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "mr-6 shrink-0",
              (showFilters || hasFilters) && "bg-[var(--primary-soft)] text-blue-300",
            )}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal />
          </Button>
        </div>

        {(showFilters || hasFilters) && (
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-4 py-2.5">
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
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
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

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {shown.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-[var(--subtle)]">
              {active
                ? pending
                  ? "Searching…"
                  : "No matches."
                : "Type to search across every topic and problem."}
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {shown.map((r) =>
                r.kind === "topic" ? (
                  <li key={`t-${r.id}`}>
                    <button
                      onClick={() => go(`/roadmap/${r.slug}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
                    >
                      <Route className="size-4 shrink-0 text-[var(--subtle)]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-[var(--foreground)]">
                          {r.title}
                        </span>
                        <span className="block truncate text-xs text-[var(--subtle)]">
                          Phase {r.phase} · {r.phaseTitle}
                        </span>
                      </span>
                      <Badge
                        variant={TOPIC_STATUS_META[r.status as TopicStatus]?.badge}
                      >
                        {TOPIC_STATUS_META[r.status as TopicStatus]?.label ?? r.status}
                      </Badge>
                    </button>
                  </li>
                ) : (
                  <li key={`p-${r.id}`}>
                    <button
                      onClick={() => go(`/roadmap/${r.topicSlug}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          background: PLATFORM_META[
                            r.platform as keyof typeof PLATFORM_META
                          ]?.color,
                        }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-[var(--foreground)]">
                          {r.title}
                        </span>
                        <span className="block truncate text-xs text-[var(--subtle)]">
                          {platformLabel(r.platform)} · {r.topicTitle}
                          {splitTags(r.tags).length > 0 &&
                            ` · ${splitTags(r.tags).join(", ")}`}
                        </span>
                      </span>
                      <Badge
                        variant={DIFFICULTY_META[r.difficulty as Difficulty]?.badge}
                      >
                        {DIFFICULTY_META[r.difficulty as Difficulty]?.label ??
                          r.difficulty}
                      </Badge>
                      <Badge
                        variant={
                          PROBLEM_STATUS_META[r.status as ProblemStatus]?.badge
                        }
                      >
                        {PROBLEM_STATUS_META[r.status as ProblemStatus]?.label ??
                          r.status}
                      </Badge>
                    </button>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
