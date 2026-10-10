"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  PenLine,
  Loader2,
  Sparkles,
  FileText,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkflowTooltip } from "@/components/cases/workflow-tooltips";

interface DraftViewProps {
  caseId: string;
  caseData: {
    id: string;
    title: string;
    courtType: string;
    jurisdiction: string;
    plaintiff: string | null;
    defendant: string | null;
    claims: Array<{ id: string; claimType: string; elements: unknown }>;
    facts: Array<{ id: string; statement: string; date: Date | null; category: string }>;
    evidence: Array<{ id: string; title: string; type: string }>;
    timeline: Array<{ id: string; date: Date; title: string; description: string | null }>;
    witnesses: Array<{ id: string; name: string; statement: string | null }>;
    damages: Array<{ id: string; category: string; amount: number; description: string | null }>;
    analyses: Array<{ id: string; claimStrength: string; dismissalRisk: string }>;
    drafts: Array<{
      id: string;
      type: string;
      title: string;
      content: string;
      sections: unknown;
      citations: unknown;
      version: number;
      status: string;
      createdAt: Date;
      comments: Array<{ id: string }>;
    }>;
  };
}

export function DraftView({ caseId, caseData }: DraftViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [draftType, setDraftType] = useState<string>("COMPLAINT");
  const [motionKind, setMotionKind] = useState<string>("MTD_RESPONSE");
  const latestDraft = caseData.drafts[0];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: draftType,
          motionKind: draftType === "MOTION" ? motionKind : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Draft generation failed");
      }
      toast.success("Draft generated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Draft generation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!latestDraft || loading) {
    return (
      <Card className="flex flex-col items-center justify-center py-16">
        <CardContent className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <PenLine className="h-8 w-8 text-primary" />
            )}
          </div>
          <h3 className="text-lg font-semibold">
            {loading ? "Drafting your complaint..." : "Generate Complaint Draft"}
          </h3>
          <p className="mb-6 mt-1 max-w-md text-sm text-muted-foreground">
            {loading
              ? "AI is generating a structured complaint with proper caption, jurisdiction, factual allegations, causes of action, and prayer for relief."
              : "Generate a complete, court-ready complaint with citations, element-based pleading, and Iqbal/Twombly plausibility compliance."}
          </p>
          {!loading && (
            <div className="mx-auto flex max-w-md flex-col items-center gap-3">
              <div className="flex w-full items-center justify-center gap-2">
                <span className="text-sm font-medium">Document type</span>
                <WorkflowTooltip step="draft" />
              </div>
              <Select value={draftType} onValueChange={(v) => setDraftType(v ?? "COMPLAINT")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPLAINT">Complaint</SelectItem>
                  <SelectItem value="ANSWER">Answer (defendant)</SelectItem>
                  <SelectItem value="MOTION">Motion</SelectItem>
                  <SelectItem value="AMENDMENT">Amended complaint</SelectItem>
                </SelectContent>
              </Select>
              {draftType === "MOTION" && (
                <Select value={motionKind} onValueChange={(v) => setMotionKind(v ?? "MTD_RESPONSE")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTD_RESPONSE">Opposition to MTD</SelectItem>
                    <SelectItem value="MOTION_TO_COMPEL">Motion to compel</SelectItem>
                    <SelectItem value="OPPOSITION">Opposition brief</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Button onClick={handleGenerate} size="lg" className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate draft
              </Button>
            </div>
          )}
          {loading && (
            <div className="mx-auto max-w-md space-y-2 text-left">
              <LoadingStep text="Drafting caption and jurisdiction" />
              <LoadingStep text="Pleading factual allegations" />
              <LoadingStep text="Structuring causes of action" />
              <LoadingStep text="Adding citations and precedent" />
              <LoadingStep text="Writing prayer for relief" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const sections = latestDraft.sections as Array<{
    heading: string;
    body: string;
    citations: string[];
  }>;
  const citations = latestDraft.citations as Array<{
    citation: string;
    source: string;
  }>;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">{latestDraft.title}</p>
            <p className="text-xs text-muted-foreground">
              Version {latestDraft.version} • {new Date(latestDraft.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3 w-3" />
            )}
            Regenerate
          </Button>
          <Button size="sm" asChild>
            <Link href={`/cases/${caseId}/review`}>
              Review & File
              <ArrowRight className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Draft content */}
      <Card>
        <CardHeader>
          <CardTitle>Complaint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sections?.map((section, i) => (
            <div key={i}>
              {i > 0 && <Separator className="mb-6" />}
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
                {section.heading}
              </h3>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {section.body}
              </div>
              {section.citations?.length > 0 && (
                <div className="mt-3 rounded-md bg-muted/50 p-3">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">
                    Citations in this section:
                  </p>
                  {section.citations.map((c, ci) => (
                    <p key={ci} className="text-xs italic text-muted-foreground">
                      {c}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* All citations */}
      {citations && citations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Citations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {citations.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {c.source}
                  </Badge>
                  <span className="italic">{c.citation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LoadingStep({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-3 w-3 animate-spin" />
      {text}
    </div>
  );
}
