"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, Code2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const TECH = [
  "Next.js 16",
  "TypeScript strict",
  "Tailwind v4",
  "React Flow",
  "Zustand",
  "Motion",
  "Zod",
  "Vitest",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <FloatingMolecules />
      <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-20 text-center sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-fuchsia-500/10 px-3 py-1 text-[11px] uppercase tracking-wider text-fuchsia-200 ring-1 ring-fuchsia-500/30"
        >
          <Sparkles className="size-3" />
          Educational portfolio project · Phase 5
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl"
        >
          Sys
          <span className="bg-gradient-to-br from-fuchsia-300 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
            Dope
          </span>{" "}
          — interactive dopamine pathway simulator.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-zinc-400 sm:text-lg"
        >
          Drag substrate onto the pathway, watch enzymes throttle flux, release
          vesicles into the cleft, route dopamine through D1-D5 teaching hubs,
          and explore guided lessons. Side drawers merge seed data with live
          PubChem, UniProt, ChEBI, Rhea, and Europe PMC — each field carries
          citations (HMDB integration remains a documented stub).
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/play"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-fuchsia-300/50 transition hover:from-fuchsia-400 hover:to-violet-500"
          >
            Launch the simulator
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900/70 px-5 py-2.5 text-sm font-medium text-zinc-100 ring-1 ring-zinc-700 transition hover:bg-zinc-800"
          >
            <BookOpen className="size-4" />
            Read the docs
          </Link>
          <a
            href="https://github.com/Jaed256/sysdope"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-transparent px-5 py-2.5 text-sm font-medium text-zinc-300 ring-1 ring-zinc-800 transition hover:bg-zinc-900/50"
          >
            <Code2 className="size-4" />
            View source
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
        >
          {TECH.map((t) => (
            <Badge key={t} variant="neon">
              {t}
            </Badge>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const MOLECULES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: (i * 67) % 100,
  y: (i * 41) % 100,
  size: 80 + ((i * 13) % 80),
  delay: (i % 5) * 0.6,
}));

function FloatingMolecules() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      {MOLECULES.map((m) => (
        <motion.span
          key={m.id}
          className="absolute rounded-full bg-fuchsia-400/10 ring-1 ring-fuchsia-400/20 blur-2xl"
          initial={{ opacity: 0.2, scale: 0.8 }}
          animate={{
            opacity: [0.15, 0.35, 0.15],
            scale: [0.8, 1.05, 0.8],
            y: [0, -16, 0],
          }}
          transition={{
            duration: 9 + (m.id % 4) * 2,
            delay: m.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
          }}
        />
      ))}
    </div>
  );
}
