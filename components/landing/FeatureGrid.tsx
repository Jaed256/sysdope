import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Atom,
  BookOpen,
  FlaskConical,
  Network,
  ShieldAlert,
  TestTube2,
} from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Network,
    title: "Pathway as a mini-game",
    body: "React Flow renders compartments, precursors, enzymes, transporters, and D1–D5 teaching nodes. Edge dash animation reflects the headless engine’s lastFlux / lastFluxRate maps.",
  },
  {
    icon: Atom,
    title: "Headless kinetic engine",
    body: "Michaelis–Menten flux, cofactor pools, inhibitor strength sliders, vesicle saturation, vesicle releases, DAT reuptake, MAO/COMT/ALDH branches, receptor binding drive, urine HVA.",
  },
  {
    icon: ShieldAlert,
    title: "Rich alerts",
    body: "TH bottleneck, TH fully blocked cue, vesicle saturation, cytosolic overflow, DOPAL toxicity risk, cofactor starvation, synaptic overflow, urine HVA high.",
  },
  {
    icon: FlaskConical,
    title: "Citation-first drawers",
    body: "Compounds hydrate from PubChem + ChEBI. Enzymes merge UniProt + Rhea graphs. Guided lessons cite UniProt entries; HMDB/USDA stubs stay labelled until bulk keys land.",
  },
];

const PAGES = [
  { href: "/play", icon: Activity, title: "Launch the simulator", body: "Scenarios, Lab Notebook lessons, literature search panel, cofactor refill, reversible educational banner." },
  { href: "/docs", icon: BookOpen, title: "Architecture & adapters", body: "Next.js handlers, normalization layer, caching, graceful fallbacks — live adapters vs stubs." },
  { href: "/about", icon: TestTube2, title: "About & roadmap", body: "Teaching goals, phase history, kinetic placeholders, citations policy." },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HIGHLIGHTS.map((h) => (
          <article
            key={h.title}
            className="glass rounded-xl p-4"
          >
            <h.icon className="size-5 text-fuchsia-300" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-50">
              {h.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
              {h.body}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {PAGES.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group glass flex items-center justify-between gap-3 rounded-xl p-4 transition hover:bg-zinc-900/70"
          >
            <div>
              <p.icon className="size-5 text-cyan-300" />
              <p className="mt-3 text-sm font-semibold text-zinc-50">
                {p.title}
              </p>
              <p className="mt-1 text-xs text-zinc-400">{p.body}</p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-fuchsia-300" />
          </Link>
        ))}
      </div>
    </section>
  );
}
