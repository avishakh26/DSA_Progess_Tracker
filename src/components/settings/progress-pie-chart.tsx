"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tooltipStyle } from "@/lib/viz";
import type { DashboardStats } from "@/lib/queries";

export function ProgressPieChart({ stats }: { stats: DashboardStats }) {
  const data = useMemo(() => {
    return [
      { name: "Completed", value: stats.doneTopics, color: "#199e70" },
      { name: "Pending", value: stats.pendingTopics, color: "#3987e5" },
      { name: "Skipped", value: stats.skippedTopics, color: "#64748b" },
    ].filter((d) => d.value > 0);
  }, [stats]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Topic Progress</CardTitle>
        <p className="text-sm text-[var(--muted)]">
          Your overall progress across all roadmap topics.
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col sm:flex-row items-center gap-6">
        {data.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-8 text-center w-full">
            No topics tracked yet.
          </p>
        ) : (
          <>
            <div className="h-[180px] w-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-3">
              {data.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {entry.name}
                  </span>
                  <span className="text-sm text-[var(--muted)] tabular-nums ml-2">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
