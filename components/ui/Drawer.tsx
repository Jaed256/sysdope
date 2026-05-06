"use client";

import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            key="panel"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950/95 shadow-[0_0_60px_-15px_rgba(168,85,247,0.4)] backdrop-blur"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <header className="flex items-start justify-between gap-4 border-b border-zinc-800 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-zinc-50">{title}</h2>
                {subtitle && (
                  <p className="mt-0.5 text-xs text-zinc-400">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-5 text-sm text-zinc-300">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
