import { NavBar } from "@/components/landing/NavBar";

export const metadata = {
  title: "SysDope · Docs",
  description: "Architecture, data sources, and scientific limitations of SysDope.",
};

const SOURCES = [
  { name: "PubChem", status: "live", note: "PUG REST — compound hydrate (CID, formula, SMILES, synonyms, 2D PNG). Cached with revalidate hints in the route handler." },
  { name: "UniProt", status: "live", note: "JSON per accession — gene, function, catalytic activity, disease snippets, subcellular hints." },
  { name: "Rhea", status: "live", note: "Curated reaction text + EC cross references; User-Agent required for some CDNs." },
  { name: "ChEBI", status: "live", note: "OLS4 ontology term endpoint for definitions, InChI/SMILES mirrors when present." },
  { name: "Europe PMC", status: "live", note: "Peer-reviewed search for the in-app literature drawer; results cached per query." },
  { name: "HMDB", status: "stub", note: "No public JSON REST; seed links only until a licensed bulk import is added at build time." },
  { name: "USDA FoodData Central", status: "stub", note: "Requires an API key; food-occurrence slots remain placeholder until provisioned." },
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
          Architecture, adapters, and limitations.
        </h1>

        <h2 className="mt-10 text-xl font-semibold text-zinc-100">Runtime layers</h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">types/*</code> — canonical Compound, Enzyme, Reaction, Citation, SimulationState.</li>
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">lib/pathway/seed*</code> — graph content + placeholder kinetics ids.</li>
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">lib/simulation/*</code> — pure TypeScript engine (no React): tick, alerts, scenarios, cofactors.</li>
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">lib/data/*</code> — remote adapters + <code className="text-fuchsia-200">normalize.ts</code> merge helpers.</li>
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">app/api/*</code> — Route Handlers (Node runtime; cache headers / revalidate per adapter).</li>
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">components/pathway/*</code> — React Flow canvas, enzyme gates, molecule nodes, particle flux overlay layered inside RF.</li>
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">lib/knowledge/*</code> — guided-lesson corpus + cofactor tooltip strings (citations required per claim).</li>
          <li><code className="rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">lib/ui/preferencesStore.ts</code> — persisted beginner/advanced, citations toggle, disclaimer dismissal.</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold text-zinc-100">External data adapters</h2>
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

        <h2 className="mt-10 text-xl font-semibold text-zinc-100">Teaching-only graph elements</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Purple “postsynaptic drive” molecule nodes summarise dopamine signalling load per receptor family.
          They intentionally do not conserve dopamine mass (real signalling is reversible, GPCR-coupled, and spatially heterogeneous).
          Each node cites the corresponding UniProt receptor accession alongside a manual low-confidence authoring note explaining the abstraction.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-zinc-100">Source ranking</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-zinc-300">
          <li>Expert-curated biological databases (Rhea, UniProt, ChEBI, HMDB when licensed).</li>
          <li>Chemistry databases (PubChem).</li>
          <li>Government / open food databases (USDA FDC, FooDB).</li>
          <li>Peer-reviewed papers surfaced through Europe PMC.</li>
          <li>Manually curated seed JSON with explicit low-confidence citations.</li>
        </ol>
        <p className="mt-3 text-xs text-zinc-500">
          When sources disagree, citations are concatenated, deduped, and re-ranked in
          <code className="ml-1 rounded bg-zinc-900 px-1.5 py-0.5 text-fuchsia-200">lib/citations/sourceRanking.ts</code>.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-zinc-100">Scientific limitations</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Kinetic constants in <code className="rounded bg-zinc-900 px-1.5 text-fuchsia-200">lib/simulation/kineticsConfig.ts</code> are educational placeholders chosen to make teaching points legible.
          Replacing them with literature-backed numbers requires per-reaction citations and updated tests.
          All UI numbers outside verified drawers remain “relative simulation units.”
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
