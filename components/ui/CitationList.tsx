import type { Citation } from "@/types/citation";
import { rankCitations } from "@/lib/citations/sourceRanking";
import { Badge } from "./Badge";

const CONFIDENCE_VARIANT: Record<Citation["confidence"], "success" | "info" | "warning"> = {
  high: "success",
  medium: "info",
  low: "warning",
};

export function CitationList({
  citations,
  emptyHint = "No citations available yet.",
}: {
  citations: Citation[] | undefined;
  emptyHint?: string;
}) {
  if (!citations || citations.length === 0) {
    return <p className="text-xs italic text-zinc-500">{emptyHint}</p>;
  }
  const ranked = rankCitations(citations);
  return (
    <ul className="space-y-2">
      {ranked.map((c, i) => (
        <li
          key={`${c.sourceName}-${c.url ?? i}`}
          className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2.5"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-zinc-200">{c.sourceName}</span>
            <Badge variant={CONFIDENCE_VARIANT[c.confidence]}>{c.confidence}</Badge>
            <Badge variant="neutral">{c.sourceType}</Badge>
          </div>
          {c.title && (
            <p className="mt-1 text-xs text-zinc-400">{c.title}</p>
          )}
          {c.url && (
            <a
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block truncate text-xs text-fuchsia-300 hover:text-fuchsia-200 hover:underline"
            >
              {c.url}
            </a>
          )}
          {(c.doi || c.pmid) && (
            <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
              {c.doi && <span>DOI {c.doi} </span>}
              {c.pmid && <span>PMID {c.pmid}</span>}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
