"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSimulationStore } from "@/lib/simulation/store";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { CitationList } from "@/components/ui/CitationList";
import { useUIPreferences } from "@/lib/ui/preferencesStore";
import type { Compound } from "@/types/compound";

type ApiResponse = {
  compound: Compound;
  sources: { seed: boolean; pubchem: boolean; chebi?: boolean; hmdb?: boolean };
};

const Field = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number | undefined | null;
  mono?: boolean;
}) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 py-1 text-xs">
      <dt className="uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd
        className={mono ? "break-all font-mono text-zinc-100" : "text-zinc-100"}
      >
        {value}
      </dd>
    </div>
  );
};

export function CompoundDrawer() {
  const drawer = useSimulationStore((s) => s.drawer);
  const close = useSimulationStore((s) => s.closeDrawer);
  const showCitations = useUIPreferences((s) => s.showCitations);
  const open = drawer?.kind === "compound";
  const id = drawer?.kind === "compound" ? drawer.targetId : null;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [structureFailed, setStructureFailed] = useState(false);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }
    const ctl = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);
    setStructureFailed(false);
    fetch(`/api/compounds/${encodeURIComponent(id)}`, { signal: ctl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: ApiResponse) => setData(j))
      .catch((e) => {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message);
      })
      .finally(() => setLoading(false));
    return () => ctl.abort();
  }, [id]);

  const compound = data?.compound;
  const sources = data?.sources;

  return (
    <Drawer
      open={open}
      onClose={close}
      title={compound?.name ?? id ?? "Compound"}
      subtitle={compound?.compoundClass.replace("_", " ")}
    >
      {loading && (
        <div className="flex items-center gap-2 text-zinc-400">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-xs">Loading from PubChem (cached 24h)…</span>
        </div>
      )}
      {error && (
        <p className="rounded-md bg-rose-500/10 p-2 text-xs text-rose-200 ring-1 ring-rose-500/30">
          Failed to load: {error}. Showing seed data only is unavailable here.
        </p>
      )}
      {compound && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-1.5">
            {sources?.seed && <Badge variant="info">Seed</Badge>}
            {sources?.pubchem ? (
              <Badge variant="success">PubChem live</Badge>
            ) : (
              <Badge variant="warning">PubChem offline</Badge>
            )}
            {sources?.chebi ? (
              <Badge variant="success">ChEBI live</Badge>
            ) : (
              <Badge variant="warning">ChEBI offline</Badge>
            )}
            <Badge variant="warning">HMDB stub</Badge>
          </div>

          {compound.structure2dUrl && !structureFailed && (
            <div className="overflow-hidden rounded-md border border-zinc-800 bg-white">
              <img
                src={compound.structure2dUrl}
                alt={`2D structure of ${compound.name}`}
                width={300}
                height={300}
                className="h-auto w-full"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setStructureFailed(true)}
              />
            </div>
          )}
          {compound.structure2dUrl && structureFailed && compound.pubchemCid && (
            <p className="rounded-md bg-zinc-900/60 p-2 text-[11px] text-zinc-300 ring-1 ring-zinc-800">
              2D image could not load.{" "}
              <a
                className="text-fuchsia-300 underline hover:text-fuchsia-200"
                href={`https://pubchem.ncbi.nlm.nih.gov/compound/${encodeURIComponent(compound.pubchemCid)}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open structure on PubChem
              </a>
            </p>
          )}

          <section>
            <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Identity
            </h3>
            <dl>
              <Field label="Name" value={compound.name} />
              <Field
                label="Aliases"
                value={compound.aliases.slice(0, 6).join(", ")}
              />
              <Field label="IUPAC" value={compound.iupacName} />
              <Field label="Formula" value={compound.molecularFormula} mono />
              <Field
                label="Mol. weight"
                value={compound.molecularWeight ? `${compound.molecularWeight} g/mol` : undefined}
              />
              <Field label="PubChem CID" value={compound.pubchemCid} />
              <Field label="ChEBI" value={compound.chebiId} />
              <Field label="HMDB" value={compound.hmdbId} />
              <Field label="SMILES" value={compound.canonicalSmiles} mono />
              <Field label="InChIKey" value={compound.inchiKey} mono />
            </dl>
          </section>

          {compound.endogenousRole && (
            <section>
              <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Endogenous role
              </h3>
              <p className="text-xs leading-relaxed text-zinc-200">
                {compound.endogenousRole}
              </p>
            </section>
          )}

          <section>
            <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Natural sources / food
            </h3>
            {compound.naturalOccurrence && compound.naturalOccurrence.length > 0 ? (
              <ul className="space-y-2">
                {compound.naturalOccurrence.map((n) => (
                  <li
                    key={n.label}
                    className="rounded-md bg-zinc-900/40 p-2 ring-1 ring-zinc-800"
                  >
                    <p className="text-xs font-medium text-zinc-100">
                      {n.label}
                    </p>
                    <p className="text-[11px] text-zinc-400">{n.evidence}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs italic text-zinc-500">
                No source-backed food entries yet. Wire the USDA FoodData
                Central adapter (currently a stub) to populate this section.
              </p>
            )}
          </section>

          {showCitations && (
            <section>
              <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Citations
              </h3>
              <CitationList citations={compound.citations} />
            </section>
          )}
        </div>
      )}
    </Drawer>
  );
}
