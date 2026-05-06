"use client";

import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-fuchsia-500/20 text-fuchsia-100 ring-1 ring-fuchsia-400/40 hover:bg-fuchsia-500/30 hover:ring-fuchsia-300/60",
  ghost:
    "bg-transparent text-zinc-200 ring-1 ring-zinc-700 hover:bg-zinc-800/60 hover:ring-zinc-600",
  danger:
    "bg-rose-500/20 text-rose-100 ring-1 ring-rose-400/40 hover:bg-rose-500/30",
  subtle:
    "bg-zinc-800/60 text-zinc-100 ring-1 ring-zinc-700 hover:bg-zinc-700/60",
};

const SIZES: Record<Size, string> = {
  sm: "h-7 px-2.5 text-[11px]",
  md: "h-9 px-3.5 text-xs",
};

export function Button({
  children,
  variant = "ghost",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {children}
    </button>
  );
}
