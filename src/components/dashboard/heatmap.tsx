"use client";

import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HEATMAP_EMPTY, HEATMAP_RAMP } from "@/lib/viz";

const DAY_MS = 86_400_000;
const WEEKS = 53;

/** Empty cell plus a validated 4-step blue ramp (see src/lib/viz.ts). */
const LEVEL_COLORS = [HEATMAP_EMPTY, ...HEATMAP_RAMP];

function levelFor(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

function utcDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function ContributionHeatmap({
  activities,
}: {
  activities: { date: string; count: number }[];
}) {
  const { weeks, monthLabels, total } = useMemo(() => {
    const byDay = new Map(
      activities.map((a) => [utcDay(new Date(a.date)).getTime(), a.count]),
    );

    // End on today, start on the Sunday 52 weeks earlier so columns line up.
    const today = utcDay(new Date());
    const end = today.getTime() + (6 - today.getUTCDay()) * DAY_MS;
    const start = end - (WEEKS * 7 - 1) * DAY_MS;

    const weeks: { ts: number; count: number; future: boolean }[][] = [];
    const monthLabels: { week: number; label: string }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < WEEKS; w++) {
      const column: { ts: number; count: number; future: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const ts = start + (w * 7 + d) * DAY_MS;
        column.push({
          ts,
          count: byDay.get(ts) ?? 0,
          future: ts > today.getTime(),
        });
      }
      weeks.push(column);

      const month = new Date(column[0].ts).getUTCMonth();
      if (month !== lastMonth) {
        monthLabels.push({
          week: w,
          label: new Date(column[0].ts).toLocaleString("en", {
            month: "short",
            timeZone: "UTC",
          }),
        });
        lastMonth = month;
      }
    }

    const yearAgo = start;
    const total = activities
      .filter((a) => utcDay(new Date(a.date)).getTime() >= yearAgo)
      .reduce((sum, a) => sum + a.count, 0);

    return { weeks, monthLabels, total };
  }, [activities]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          <span className="font-semibold text-slate-100 tabular-nums">{total}</span>{" "}
          problems in the last year
        </p>
      </div>

      <div className="no-scrollbar overflow-x-auto pb-1">
        <div className="min-w-max">
          {/* Month ruler */}
          <div className="relative mb-1 ml-8 h-4">
            {monthLabels.map((m) => (
              <span
                key={`${m.week}-${m.label}`}
                className="absolute text-[0.65rem] text-[var(--subtle)]"
                style={{ left: `${m.week * 14}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {/* Weekday ruler */}
            <div className="mr-1 flex w-7 flex-col gap-[3px] pt-[1px]">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <span
                  key={i}
                  className="h-[11px] text-[0.6rem] leading-[11px] text-[var(--subtle)]"
                >
                  {d}
                </span>
              ))}
            </div>

            {weeks.map((column, w) => (
              <div key={w} className="flex flex-col gap-[3px]">
                {column.map((cell) =>
                  cell.future ? (
                    <span key={cell.ts} className="size-[11px]" />
                  ) : (
                    <Tooltip key={cell.ts}>
                      <TooltipTrigger asChild>
                        <span
                          className="size-[11px] rounded-[2px] ring-offset-0 transition-transform hover:scale-125 hover:ring-1 hover:ring-white/40"
                          style={{ background: LEVEL_COLORS[levelFor(cell.count)] }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="font-medium">
                          {cell.count === 0
                            ? "No problems"
                            : `${cell.count} problem${cell.count === 1 ? "" : "s"}`}
                        </span>
                        <span className="text-[var(--subtle)]">
                          {" · "}
                          {new Date(cell.ts).toLocaleDateString("en", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            timeZone: "UTC",
                          })}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 text-[0.7rem] text-[var(--subtle)]">
        Less
        {LEVEL_COLORS.map((c) => (
          <span
            key={c}
            className="size-[11px] rounded-[2px]"
            style={{ background: c }}
          />
        ))}
        More
      </div>
    </div>
  );
}
