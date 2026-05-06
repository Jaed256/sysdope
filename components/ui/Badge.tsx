import { clsx } from "clsx";
import type { ReactNode } from "react";

type BadgeVariant = "neutral" | "info" | "warning" | "danger" | "success" | "neon";

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: "bg-zinc-800/60 text-zinc-200 ring-zinc-700",
  info: "bg-sky-500/10 text-sky-300 ring-sky-500/30",
  warning: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  danger: "bg-rose-500/10 text-rose-300 ring-rose-500/30",
  success: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  neon: "bg-fuchsia-500/10 text-fuchsia-300 ring-fuchsia-500/30",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ring-1 ring-inset",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
