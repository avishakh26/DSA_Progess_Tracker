"use client";

import { useState, useTransition } from "react";
import { setTopicProgress } from "@/actions/topics";

/**
 * Drag-to-set progress. The value is committed on release rather than on every
 * input event, so one drag is one database write.
 */
export function ProgressSlider({
  topicId,
  value,
  accent = "#3b82f6",
}: {
  topicId: string;
  value: number;
  accent?: string;
}) {
  const [local, setLocal] = useState(value);
  const [, startTransition] = useTransition();

  // Adopt a new server value (e.g. status flipped to Done) during render rather
  // than in an effect, so the slider never paints a stale position first.
  const [lastProp, setLastProp] = useState(value);
  if (lastProp !== value) {
    setLastProp(value);
    setLocal(value);
  }

  const commit = (next: number) => {
    startTransition(async () => {
      await setTopicProgress(topicId, next);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={local}
        onChange={(e) => setLocal(Number(e.target.value))}
        onPointerUp={() => commit(local)}
        onKeyUp={() => commit(local)}
        aria-label="Topic progress"
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none
          [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:shadow-md
          [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
        style={{
          background: `linear-gradient(90deg, ${accent} ${local}%, rgba(148,163,184,0.14) ${local}%)`,
        }}
      />
      <span className="w-10 shrink-0 text-right text-sm text-[var(--muted)] tabular-nums">
        {local}%
      </span>
    </div>
  );
}
