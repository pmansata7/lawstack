import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CaseWorkflowGuide({
  caseId,
  isExample,
}: {
  caseId: string;
  isExample: boolean;
}) {
  return (
    <div className="mb-6 border border-navy-950/10 bg-tint px-4 py-4 sm:px-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        Workflow
      </p>
      <p className="mt-1 font-serif text-lg font-semibold text-navy-950">
        {isExample
          ? "You’re in the example matter"
          : "Five stops to a filing-ready complaint"}
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
        {isExample
          ? "Facts and damages are pre-filled so you can run analysis and generate a draft immediately. When you’re ready, create a new case and paste your client’s narrative—AI intake will map parties, claims, and elements."
          : "Build the record on Facts, run Legal analysis to close element gaps, then Draft and export from Review. Use the matter chat on the right for questions about this file."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" asChild>
          <Link href={`/cases/${caseId}/facts`}>
            {isExample ? "Explore facts" : "Continue to facts"}
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </Button>
        {isExample && (
          <Button size="sm" variant="secondary" asChild>
            <Link href="/dashboard/cases/new">Start a real matter</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
