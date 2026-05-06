# SysDope

> **Educational simulation only. Not medical advice.**
> Values are simplified and labeled "relative simulation units" unless explicitly source-backed.

SysDope is an interactive, citation-backed simulator for the dopamine pathway: synthesis from phenylalanine and tyrosine, vesicular handling via VMAT2, synaptic release at D1–D5 receptors, DAT reuptake, MAO/COMT/ALDH degradation, and the HVA urinary endpoint.

It is built as both a **portfolio project** and an **educational mini-game**. Click any molecule or enzyme on the pathway and a side drawer shows live data from PubChem, UniProt, Rhea, and ChEBI — with citations. A literature search panel queries Europe PMC live. HMDB and USDA FoodData Central remain documented stubs (see Adapter status below).

## What you can do

- Drag substrate (Phe, Tyr, L-DOPA, dopamine) into the pathway and watch it propagate through enzymes.
- Throttle every enzyme/transporter on a 5-state control: `inhibit`, `partial`, `normal`, `upregulate`, `overexpress`.
- Trigger vesicle release into the synaptic cleft and watch DAT reuptake clear it.
- Run preset scenarios (TH inhibition, MAO inhibition, ALDH inhibition, VMAT2 inhibition, DAT inhibition, precursor overload).
- See live alerts when known failure modes appear: **TH bottleneck**, **vesicle saturation**, **cytosolic dopamine overflow**, **DOPAL toxicity**, **synaptic dopamine overflow**, **HVA urinary output increased**.

The single most important teaching point is built into the kinetics:

> **TH (tyrosine hydroxylase) is the rate-limiting step.** Even with abundant tyrosine, downstream dopamine cannot exceed TH's vmax × activity. The simulator lets you watch that bottleneck appear.

## Run locally

Requirements: **Node.js 22+** and npm 10+.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm test             # vitest unit tests for the simulation engine
npm run typecheck    # tsc --noEmit on app + test configs
```

## Tech stack

- **Next.js 16** with the App Router and Turbopack
- **React 19** + **TypeScript** (strict mode)
- **Tailwind CSS v4** for styling, with a dark biotech / neon aesthetic
- **@xyflow/react** (React Flow) for the pathway graph
- **Zustand** for the headless simulation store
- **Motion** (`motion/react`) for tasteful animations
- **Zod** for runtime validation of external API responses
- **Vitest** + **@testing-library** for tests
- **Vercel-ready** — runs on Fluid Compute with Node 24, no extra config

## Project layout

```
app/
  page.tsx               landing
  about/page.tsx         project goals + phase plan
  docs/page.tsx          architecture, source ranking, API endpoints
  play/                  the simulator (PlayWorkspace.tsx)
  api/
    pathway/             seed graph
    compounds/[id]/      seed + live PubChem (merged via normalize.ts)
    enzymes/[id]/        seed merged with live UniProt + Rhea (by EC)
    reactions/[id]/      seed + live Rhea reactions for the enzyme's EC
    literature/search/   live Europe PMC search (?q=, ?limit=)
    sources/health/      pings every adapter; reports live vs stub status

components/
  landing/               NavBar, Hero, FeatureGrid, DisclaimerBanner
  pathway/               PathwayCanvas + MoleculeNode + EnzymeGate +
                         ReactionEdge + ParticleLayer + PrecursorTray +
                         SynapseMiniGame
  panels/                LevelsDashboard, EnzymeControls,
                         SimulationControls, AlertCenter, CompoundDrawer,
                         EnzymeDrawer, ScenarioCards, LabNotebook
  ui/                    Drawer, Badge, Button, CitationList

lib/
  pathway/seed*          seed Compounds, Enzymes, Reactions
  pathway/graph.ts       builds React Flow nodes/edges from seeds
  simulation/            kinetics, engine tick, alerts, scenarios, store
  data/                  pubchem (live), rhea/uniprot/chebi/hmdb/
                         literature (Europe PMC live)
                         hmdb / foodSources (documented stubs)
                         normalize (merge seed + live)
  citations/             source-ranking and bestCitation()

types/                   canonical Compound, Enzyme, Reaction, Citation,
                         SimulationState

tests/                   simulation.test.ts (Vitest)
```

## Data-source strategy

Everything is sourced through small per-source adapters that all return the same internal shape, then merged in `lib/data/normalize.ts`:

1. **Expert-curated databases** (Rhea, UniProt, ChEBI, HMDB) — top tier
2. **Chemistry databases** (PubChem) — wired live in Phase 1
3. **Government / open food databases** (USDA FoodData Central, FooDB)
4. **Peer-reviewed papers** (Europe PMC, PubMed, Semantic Scholar, OpenAlex)
5. **Manually curated fallback JSON** — clearly labeled `confidence: low`

Citation ranking lives in [`lib/citations/sourceRanking.ts`](lib/citations/sourceRanking.ts). When sources disagree the higher-confidence source wins, citations are concatenated, deduped by `(sourceName, url)`, and re-ranked.

### Adapter status

| Source                    | Status | Notes |
|---------------------------|--------|-------|
| PubChem                   | live   | PUG-REST: IUPAC, formula, MW, SMILES, InChIKey, image, synonyms. Cached 24h via Next `fetch` `revalidate`. |
| UniProt                   | live   | `https://rest.uniprot.org/uniprotkb/<accession>.json` — protein name, gene symbol, EC number, function, catalytic activity (with Rhea cross-refs), subcellular location, disease comments. Zod-validated, 24h cache. |
| Rhea                      | live   | `https://www.rhea-db.org/rhea?query=...&format=json` — fetched both by Rhea ID and by EC number for the enzyme drawer. Zod-validated, 24h cache. |
| ChEBI                     | live   | EBI OLS4 API (`/ontologies/chebi/terms?obo_id=CHEBI:<id>`) — definition, formula, SMILES, InChI fallbacks. Zod-validated, 24h cache. |
| Europe PMC                | live   | `/europepmc/webservices/rest/search` — title, abstract, PMID, DOI, journal, year. Backs the in-app Literature search panel. Zod-validated, 6h cache. |
| HMDB                      | stub   | No public JSON REST. The intended Phase 4 path is to download the bulk XML dataset, transform once at build time, and serve a static index. See `lib/data/hmdb.ts` header for details. |
| USDA FoodData Central     | stub   | Requires an API key. Wire when key is provisioned. |

`/api/sources/health` pings every source and returns `{ source, status, ok, latencyMs, note? }[]`. The `status` field distinguishes `live` adapters from documented `stub`s.

## Scientific limitations

- **All numeric values are "relative simulation units"** — they are NOT serum concentrations, NOT in-vitro Vmax/Km, and NOT clinical reference ranges.
- **Kinetic constants in `lib/pathway/seedReactions.ts` are educational placeholders** chosen so the teaching points (TH bottleneck, ALDH/DOPAL coupling, etc.) emerge clearly. Real values would require per-reaction citations and would replace the seed entries.
- **Receptor signaling is not modeled** — D1–D5 are decoration: clicking a receptor opens its data drawer but does not yet drive a Gs/Gi cascade.
- **No clinical advice.** SysDope is a teaching toy.

## Simulation engine

Pure TypeScript, no React imports — see [`lib/simulation/engine.ts`](lib/simulation/engine.ts). Per tick:

```
rate = vmax * enzymeActivity * (1 - inhibitor) * S / (km + S)
```

Then the engine debits the source compartment, credits the destination, applies vesicle-capacity caps for VMAT2, processes pending vesicle release events, applies a small synaptic diffusion sink, recomputes alerts, and updates rolling history buffers. Concentrations are clamped to ≥ 0.

## Tests

```bash
npm test
```

Six unit tests in `tests/simulation.test.ts`:

- Concentrations never go below zero across 1000 ticks of a noisy scenario.
- TH bottleneck: high tyrosine + inhibited TH yields strictly less downstream dopamine than baseline, and the TH-bottleneck alert fires.
- ALDH inhibition: DOPAL accumulates strictly more than baseline.
- VMAT2 inhibition: vesicular DA decreases and cytosolic DA increases vs baseline.
- DAT inhibition: synaptic DA half-life after a release pulse is longer than baseline.
- HVA urinary output increases over time when DA is being released and degradation pathways are active.

## Deploy on Vercel

SysDope is a plain Next.js 16 app — no `vercel.json` or `vercel.ts` is required for Phase 1. Pushing the repo to a Vercel project will build and deploy it on Fluid Compute (Node 24). Route handlers run as Vercel Functions; `/api/compounds/[id]` calls PubChem with Next's built-in cache (`revalidate: 86400`).

```bash
# from the repo root, with the Vercel CLI installed
vercel deploy        # preview
vercel deploy --prod # production
```

## Roadmap

- **Phase 2** ✅ — kinetic-config extraction, inhibitor strength dial, BH4/SAM/NAD+ cofactor pools, adaptive substepping, real flux particles, layout pass, combo scenarios.
- **Phase 3** ✅ — live UniProt, Rhea, ChEBI, and Europe PMC adapters with Zod validation, per-source caching, graceful fallback, in-app literature search panel, and a sources health endpoint that distinguishes live vs documented-stub adapters.
- **Phase 4** ✅ — six guided lessons (TH bottleneck, MAO inhibition, ALDH protects against DOPAL, VMAT2 sequestration, DAT and synaptic duration, COMT and HVA) with one-click "Try it" scenario buttons, citation-backed cofactor tooltips for BH4 / Fe(II) / PLP / ascorbate / Cu(II) / O2 / FAD / SAM / NAD+ / Mg(II) / proton & Na/Cl gradients, beginner ↔ advanced UI mode toggle, and a show-citations toggle (persisted to localStorage). HMDB bulk-import pipeline still pending.
- **Phase 5** — portfolio polish: animated previews, expanded `/about` and `/docs`, screenshots, HMDB bulk-import.

## License

Educational use. SysDope cites third-party data sources in-app — please respect their individual licenses (PubChem is public domain; HMDB requires attribution and a license for commercial use; UniProt is CC BY 4.0; Rhea is CC BY 4.0).
