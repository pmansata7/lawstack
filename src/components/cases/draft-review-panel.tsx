"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DraftReviewPanel({
  caseId,
  draftId,
  initialReport,
}: {
  caseId: string;
  draftId: string;
  initialReport?: {
    overallScore?: number;
    filingReady?: boolean;
    summary?: string;
    issues?: Array<{ severity: string; section: string; issue: string }>;
  } | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(initialReport);

  const runReview = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/cases/${caseId}/drafts/${draftId}/review`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Review failed");
      setReport(data.report);
      toast.success("Review agent finished");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Review failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-md border border-navy-950/10 bg-tint p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          <h3 className="font-serif font-semibold">Draft review agent</h3>
        </div>
        <Button size="sm" onClick={runReview} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          Run review
        </Button>
      </div>
      {report && (
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex flex-wrap gap-2">
            {report.overallScore != null && (
              <Badge>Score {report.overallScore}/100</Badge>
            )}
            <Badge variant={report.filingReady ? "default" : "secondary"}>
              {report.filingReady ? "Filing ready" : "Needs work"}
            </Badge>
          </div>
          {report.summary && <p className="text-ink-600">{report.summary}</p>}
          {report.issues?.slice(0, 5).map((issue, i) => (
            <p key={i} className="text-xs text-ink-600">
              <span className="font-medium uppercase">{issue.severity}</span>{" "}
              {issue.section}: {issue.issue}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
