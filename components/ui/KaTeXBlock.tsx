"use client";

import katex from "katex";
import "katex/dist/katex.min.css";
import { useEffect, useRef } from "react";

type Props = {
  /** LaTeX math string (not wrapped in delimiters). */
  latex: string;
  /** `true` for display math, `false` for inline. */
  displayMode?: boolean;
  className?: string;
};

/**
 * Client-only KaTeX render. Falls back to monospace source if KaTeX throws.
 */
export function KaTeXBlock({
  latex,
  displayMode = true,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    try {
      katex.render(latex, el, {
        displayMode,
        throwOnError: false,
        strict: "ignore",
        trust: false,
      });
    } catch {
      el.textContent = latex;
    }
  }, [latex, displayMode]);

  return (
    <div
      ref={ref}
      className={className}
      // KaTeX injects presentation MathML/HTML; avoid hydration mismatch.
      suppressHydrationWarning
    />
  );
}
