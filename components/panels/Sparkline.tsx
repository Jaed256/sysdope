"use client";

import { useMemo } from "react";

/**
 * Tiny dependency-free SVG sparkline. Avoids pulling in a chart library for
 * Phase 1.
 */
export function Sparkline({
  values,
  width = 96,
  height = 22,
  stroke = "#e879f9",
  className,
}: {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  className?: string;
}) {
  const path = useMemo(() => {
    if (values.length < 2) return "";
    const max = Math.max(1, ...values);
    const stepX = width / Math.max(1, values.length - 1);
    return values
      .map((v, i) => {
        const x = i * stepX;
        const y = height - (Math.max(0, v) / max) * height;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [values, width, height]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
      className={className}
    >
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.4} />
    </svg>
  );
}
