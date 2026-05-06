import { Info } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <aside
      role="note"
      className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-[11px] text-amber-200"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <Info className="size-3.5 shrink-0" />
        <p>
          <strong className="font-semibold">Educational simulation only.</strong> Not medical
          advice. Values are simplified and labeled "relative simulation units" unless explicitly
          source-backed.
        </p>
      </div>
    </aside>
  );
}
