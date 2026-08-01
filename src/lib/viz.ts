/**
 * Chart palette. Every ramp here was checked with the data-viz validator against
 * this app's dark chart surface (#131c31) — don't substitute hexes by eye.
 *
 *   node scripts/validate_palette.js "<hex,…>" --mode dark --surface "#131c31"
 */

/** Categorical slots, in fixed order. Assign by index; never cycle past the end. */
export const SERIES = [
  "#3987e5", // blue
  "#d95926", // orange
  "#199e70", // aqua
  "#c98500", // yellow
  "#d55181", // magenta
  "#008300", // green
  "#9085e9", // violet
] as const;

/** Beyond SERIES.length categories, the tail folds into this neutral. */
export const SERIES_OTHER = "#64748b";

export function seriesColor(index: number) {
  return index < SERIES.length ? SERIES[index] : SERIES_OTHER;
}

/**
 * Difficulty is ordered (Easy → Hard), so it gets a single-hue ordinal ramp
 * rather than the green/amber/rose badge colors — that trio fails CVD
 * separation (red↔green ΔE 5.6) once the marks sit next to each other.
 */
export const DIFFICULTY_RAMP: Record<string, string> = {
  EASY: "#9ec5f4",
  MEDIUM: "#3987e5",
  HARD: "#184f95",
};

/** Heatmap levels 1–4 (level 0 is the near-surface empty cell). */
export const HEATMAP_RAMP = ["#1c5cab", "#2a78d6", "#5598e7", "#9ec5f4"] as const;
export const HEATMAP_EMPTY = "var(--border)";

/** Chart chrome. */
export const AXIS = "var(--subtle)";
export const GRID = "var(--border)";
export const SURFACE = "var(--surface)";

/** Shared Recharts tooltip styling. */
export const tooltipStyle = {
  contentStyle: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(12px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "0.75rem",
    fontSize: "0.8125rem",
    color: "var(--foreground)",
    boxShadow: "0 12px 40px -12px rgba(0,0,0,0.3)",
  },
  labelStyle: { color: "var(--foreground)", fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: "var(--foreground)" },
  cursor: { fill: "var(--primary-soft)" },
} as const;
