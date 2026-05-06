import { NavBar } from "@/components/landing/NavBar";

export const metadata = {
  title: "SysDope · Docs",
  description: "Architecture, data sources, and scientific limitations of SysDope.",
};

const SOURCES = [
  { name: "PubChem", status: "live", note: "PUG-REST adapter — IUPAC, formula, MW, SMILES, InChIKey, image, synonyms." },
  { name: "Rhea", status: "stub", note: "Adapter signature in place; replace stub with REST fetch." },
  { name: "UniProt", status: "stub", note: "Adapter signature in place; replace stub with /uniprotkb/<id>.json." },
  { name: "ChEBI", status: "stub", note: "Use OLS4 or ChEBI web services." },
  { name: "HMDB", status: "stub", note: "Free use requires the XML dump under HMDB license." },
  { name: "Europe PMC / PubMed", status: "stub", note: "Wire one of E-utilities, Europe PMC, Semantic Scholar, or OpenAlex." },
  { name: "USDA FoodData Central", status: "stub", note: "Used only for source-backed natural-occurrence claims." },
];

const STATUS_STYLE: Record<string, string> = {
  live: "bg-emerald-500/10 text-emerald-200 ring-emerald-500/30",
  stub: "bg-amber-500/10 text-amber-200 ring-amber-500/30",
};

export default function DocsPage() {
  return (
    <main className="min-h-screen">
      <NavBar />
      <article className="mx-auto max-w-3xl px-6 py-16 text-zinc-300">
        <p className="text-[11px] uppercase tracking-wider text-fuchsia-300">Docs</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight text-zinc-50">
          Architecture and data sources.
        </h1>

        <h2 className="mt-10 text-xl font-semibold text-zinc-100">Layers</h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">types/*</code> — canonical Compound, Enzyme, Reaction, Citation, SimulationState.</li>
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">lib/pathway/seed*</code> — hand-curated seed graph with placeholder citations.</li>
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">lib/simulation/*</code> — pure-TS engine: kinetics → tick → alerts.</li>
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">lib/data/*</code> — adapter per external source, all returning the same internal shape; merged via <code>normalize.ts</code>.</li>
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">app/api/*</code> — Next.js Route Handlers (Node runtime, Fluid Compute on Vercel).</li>
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">components/pathway/*</code> — React Flow custom nodes / edges + ambient particles.</li>
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">components/panels/*</code> — dashboard, controls, drawers, alerts, scenarios.</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold text-zinc-100">Data sources</h2>
        <ul className="mt-3 space-y-2">
          {SOURCES.map((s) => (
            <li
              key={s.name}
              className="flex items-start justify-between gap-3 rounded-md bg-zinc-900/40 p-3 ring-1 ring-zinc-800"
            >
              <div>
                <p className="text-sm font-medium text-zinc-50">{s.name}</p>
                <p className="mt-0.5 text-xs text-zinc-400">{s.note}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${STATUS_STYLE[s.status]}`}
              >
                {s.status}
              </span>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-xl font-semibold text-zinc-100">Source ranking</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-zinc-300">
          <li>Expert-curated biological databases (Rhea, UniProt, ChEBI, HMDB).</li>
          <li>Chemistry databases (PubChem).</li>
          <li>Government / open food databases (USDA FDC, FooDB).</li>
          <li>Peer-reviewed papers.</li>
          <li>Manually curated fallback JSON.</li>
        </ol>
        <p className="mt-3 text-xs text-zinc-500">
          When sources disagree the higher-confidence source wins, citations are
          concatenated, deduped, and re-ranked. See
          <code className="ml-1 rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">lib/citations/sourceRanking.ts</code>.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-zinc-100">Scientific limitations</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          The kinetic constants in the seed reactions are deliberate
          educational placeholders chosen to make the teaching points visible.
          They are not literature-derived rate constants. Real values would
          require per-reaction citations and would replace the seed entries.
          The simulation tracks "relative simulation units" — never serum or
          tissue concentrations.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-zinc-100">API endpoints</h2>
        <ul className="mt-3 space-y-1 font-mono text-xs text-zinc-300">
          <li><span className="text-fuchsia-300">GET</span> /api/pathway</li>
          <li><span className="text-fuchsia-300">GET</span> /api/compounds/[id]</li>
          <li><span className="text-fuchsia-300">GET</span> /api/enzymes/[id]</li>
          <li><span className="text-fuchsia-300">GET</span> /api/reactions/[id]</li>
          <li><span className="text-fuchsia-300">GET</span> /api/literature/search?q=</li>
          <li><span className="text-fuchsia-300">GET</span> /api/sources/health</li>
        </ul>
      </article>
    </main>
  );
}
