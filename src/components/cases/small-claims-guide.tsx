import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProceduralRulePack } from "@/lib/legal/procedural-rule-packs";

export function SmallClaimsGuide({
  caseId,
  jurisdiction,
  guided,
}: {
  caseId: string;
  jurisdiction: string;
  guided: boolean;
}) {
  if (!guided && !jurisdiction.includes("small-claims")) return null;

  const pack = getProceduralRulePack(jurisdiction);

  return (
    <div className="mb-6 border border-navy-950/15 bg-tint px-4 py-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        Small claims guided path
      </p>
      <p className="mt-1 font-serif text-lg font-semibold text-navy-950">
        Plain steps to filing
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-600">
        <li>Confirm amount is within the court limit and parties are correct.</li>
        <li>Document demand letter or outreach before filing.</li>
        <li>Complete adaptive intake and upload photos, leases, or receipts.</li>
        <li>Run analysis, then generate a small-claims complaint draft.</li>
        <li>Export from Review and file using your county form.</li>
      </ol>
      {pack && (
        <ul className="mt-3 space-y-1 text-xs text-ink-500">
          {pack.items.slice(0, 4).map((item) => (
            <li key={item.id}>• {item.requirement}</li>
          ))}
        </ul>
      )}
      <Button size="sm" className="mt-4" asChild>
        <Link href={`/cases/${caseId}/analysis`}>Continue to analysis</Link>
      </Button>
    </div>
  );
}
