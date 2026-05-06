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
    body: "React Flow renders compounds, enzymes, and transporters across cellular compartments. Edges glow brighter when flux rises.",
  },
  {
    icon: Atom,
    title: "Headless kinetic engine",
    body: "Simplified Michaelis–Menten flux per reaction with enzyme-activity multipliers, vesicle capacity, DAT reuptake, and degradation sinks.",
  },
  {
    icon: ShieldAlert,
    title: "Threshold alerts",
    body: "TH bottleneck, vesicle saturation, cytosolic dopamine overflow, DOPAL toxicity, and synaptic overflow surface as in-game toasts.",
  },
  {
    icon: FlaskConical,
    title: "Source-backed drawers",
    body: "Click any molecule for live PubChem identifiers, structures, and citations. Click any enzyme for gene, EC number, cofactors, and inhibition effects.",
  },
];

const PAGES = [
  { href: "/play", icon: Activity, title: "Launch the simulator", body: "Drag substrate, manipulate enzymes, run scenarios, watch the alerts fire." },
  { href: "/docs", icon: BookOpen, title: "Architecture & data sources", body: "Where the data comes from, why TH is the bottleneck, what's stubbed in Phase 1." },
  { href: "/about", icon: TestTube2, title: "About the project", body: "Goals, scientific limitations, and what each phase will add." },
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
