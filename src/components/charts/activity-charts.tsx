"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS, GRID, DIFFICULTY_RAMP, seriesColor, tooltipStyle } from "@/lib/viz";

const axisProps = {
  stroke: AXIS,
  tick: { fill: AXIS, fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: GRID },
} as const;

/** Problems solved per day over the last two weeks. Single series — no legend. */
export function DailyBarChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} {...axisProps} width={40} />
        <Tooltip {...tooltipStyle} />
        <Bar
          dataKey="count"
          name="Problems"
          fill={seriesColor(0)}
          radius={[4, 4, 0, 0]}
          maxBarSize={26}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Monthly totals split by difficulty — a validated single-hue ordinal ramp. */
export function MonthlyStackedChart({
  data,
}: {
  data: { label: string; easy: number; medium: number; hard: number }[];
}) {
  return (
    <div>
      {/* Legend is plain HTML rather than <Legend>: Recharts orders the auto
          legend by render order, which puts the stack out of sequence. */}
      <Legend
        items={[
          { label: "Easy", color: DIFFICULTY_RAMP.EASY },
          { label: "Medium", color: DIFFICULTY_RAMP.MEDIUM },
          { label: "Hard", color: DIFFICULTY_RAMP.HARD },
        ]}
      />
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis allowDecimals={false} {...axisProps} width={40} />
          <Tooltip {...tooltipStyle} />
          <Bar
            dataKey="easy"
            name="Easy"
            stackId="d"
            fill={DIFFICULTY_RAMP.EASY}
            maxBarSize={34}
          />
          <Bar
            dataKey="medium"
            name="Medium"
            stackId="d"
            fill={DIFFICULTY_RAMP.MEDIUM}
            maxBarSize={34}
          />
          <Bar
            dataKey="hard"
            name="Hard"
            stackId="d"
            fill={DIFFICULTY_RAMP.HARD}
            radius={[4, 4, 0, 0]}
            maxBarSize={34}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-1.5 text-xs text-[var(--muted)]"
        >
          <span
            className="size-2.5 rounded-full"
            style={{ background: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/** Cumulative problems over time. */
export function CumulativeAreaChart({
  data,
}: {
  data: { label: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="cumulativeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={seriesColor(0)} stopOpacity={0.35} />
            <stop offset="100%" stopColor={seriesColor(0)} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis allowDecimals={false} {...axisProps} width={44} />
        <Tooltip {...tooltipStyle} />
        <Area
          type="monotone"
          dataKey="total"
          name="Total solved"
          stroke={seriesColor(0)}
          strokeWidth={2}
          fill="url(#cumulativeFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Horizontal magnitude chart — used for topics per phase and platform counts. */
export function HorizontalBarChart({
  data,
  height = 380,
  categorical = false,
}: {
  data: { label: string; value: number }[];
  height?: number;
  categorical?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" allowDecimals={false} {...axisProps} />
        <YAxis
          type="category"
          dataKey="label"
          {...axisProps}
          width={140}
          tick={{ fill: AXIS, fontSize: 11 }}
        />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="value" name="Problems" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((d, i) => (
            <Cell key={d.label} fill={categorical ? seriesColor(i) : seriesColor(0)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
