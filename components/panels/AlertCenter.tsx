"use client";

import { AlertTriangle, Info, ShieldAlert, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSimulationStore } from "@/lib/simulation/store";
import type { AlertSeverity } from "@/types/simulation";

const SEVERITY_STYLE: Record<
  AlertSeverity,
  { ring: string; bg: string; icon: typeof Info }
> = {
  info: {
    ring: "ring-sky-500/40",
    bg: "bg-sky-500/10",
    icon: Info,
  },
  warning: {
    ring: "ring-amber-500/40",
    bg: "bg-amber-500/10",
    icon: AlertTriangle,
  },
  danger: {
    ring: "ring-rose-500/40",
    bg: "bg-rose-500/10",
    icon: ShieldAlert,
  },
};

export function AlertCenter() {
  const alerts = useSimulationStore((s) => s.alerts);
  const dismissAlert = useSimulationStore((s) => s.dismissAlert);

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-30 flex max-w-sm flex-col gap-2">
      <AnimatePresence>
        {alerts.map((a) => {
          const style = SEVERITY_STYLE[a.severity];
          const Icon = style.icon;
          return (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto relative rounded-lg ${style.bg} pr-9 pl-3 py-2.5 ring-1 ${style.ring} backdrop-blur`}
            >
              <button
                type="button"
                aria-label={`Dismiss ${a.title}`}
                className="absolute right-2 top-2 rounded p-0.5 text-zinc-400 transition hover:bg-zinc-800/80 hover:text-zinc-100"
                onClick={() => dismissAlert(a.id)}
              >
                <X className="size-3.5" strokeWidth={2.5} />
              </button>
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 size-4 shrink-0 text-zinc-100" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-50">
                    {a.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-zinc-200">
                    {a.message}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
