"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";

export function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
}) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => {
    return `${prefix}${Math.round(current).toLocaleString()}${suffix}`;
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}
