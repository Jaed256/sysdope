"use client";

import Link from "next/link";
import { motion } from "motion/react";

/**
 * Lightweight “preview” frame for the landing page — not a live iframe (keeps
 * LCP simple) but channels the same visual language as /play.
 */
export function SimulatorPreview() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 p-1 ring-1 ring-fuchsia-500/20"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_-10%,rgba(232,121,249,0.22),transparent_55%),radial-gradient(circle_at_80%_120%,rgba(34,211,238,0.15),transparent_50%)]" />
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-fuchsia-300">
              Simulator
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-50">
              Pathway canvas + kinetic engine + live citations
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
              Flux particles ride the edges, compartments are color-banded,
              vesicle releases spike synaptic dopamine, postsynaptic D1-D5 hubs
              show binding drive, drawers pull UniProt / PubChem / Rhea /
              Europe PMC live.
            </p>
          </div>
          <Link
            href="/play"
            className="self-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg ring-1 ring-fuchsia-300/40 transition hover:from-fuchsia-400 hover:to-violet-500"
          >
            Open live canvas
          </Link>
        </div>
        <div className="relative mx-auto mb-4 h-52 max-w-[720px] overflow-hidden rounded-xl border border-zinc-800 bg-[#09090d]">
          <div className="absolute inset-x-10 top-4 h-1.5 rounded-full bg-gradient-to-r from-cyan-400/70 via-fuchsia-400/60 to-violet-400/50 blur-sm" />
          <div className="absolute inset-0 grid grid-cols-6 gap-2 p-9 opacity-[0.18]">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.span
                key={i}
                className="rounded-md border border-fuchsia-500/30 bg-fuchsia-500/5"
                animate={{ opacity: [0.08, 0.55, 0.08], scaleY: [0.4, 1, 0.4] }}
                transition={{
                  duration: 8 + ((i * 53) % 9) / 3,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="absolute size-3 rounded-full bg-fuchsia-300 shadow-[0_0_14px_rgba(232,121,249,0.9)]"
              style={{ top: `${28 + ((i * 73) % 90)}px`, left: `${24 + ((i * 109) % 420)}px` }}
              animate={{ x: [0, 120, 0], opacity: [0.35, 1, 0.35], scale: [1, 1.4, 1] }}
              transition={{
                duration: 5 + ((i + 41) % 7) / 2,
                delay: i * 0.85,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
