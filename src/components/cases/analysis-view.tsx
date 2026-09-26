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
  Brain,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AnalysisViewProps {
  caseId: string;
  caseData: {
    id: string;
    title: string;
    courtType: string;
    jurisdiction: string;
    plaintiff: string | null;
    defendant: string | null;
    claims: Array<{
      id: string;
      claimType: string;
      elements: unknown;
    }>;
    facts: Array<{
      id: string;
      statement: string;
      date: Date | null;
      category: string;
    }>;
    evidence: Array<{ id: string; title: string; type: string }>;
    timeline: Array<{
      id: string;
      date: Date;
      title: string;
      description: string | null;
    }>;
    witnesses: Array<{
      id: string;
      name: string;
      statement: string | null;
    }>;
    damages: Array<{
      id: string;
      category: string;
      amount: number;
      description: string | null;
    }>;
    analyses: Array<{
      id: string;
      elementMapping: unknown;
      strengths: unknown;
      vulnerabilities: unknown;
      dismissalRisk: string;
      riskReasoning: string | null;
      citedCases: unknown;
      proceduralChecklist: unknown;
      claimStrength: string;
      createdAt: Date;
    }>;
  };
}

const RISK_CONFIG = {
  low: { color: "bg-green-100 text-green-800", icon: CheckCircle2, label: "Low Risk" },
  medium: { color: "bg-amber-100 text-amber-800", icon: AlertCircle, label: "Medium Risk" },
  high: { color: "bg-red-100 text-red-800", icon: AlertTriangle, label: "High Risk" },
};

const STRENGTH_CONFIG = {
  strong: { color: "bg-green-100 text-green-800", icon: TrendingUp, label: "Strong" },
  moderate: { color: "bg-amber-100 text-amber-800", icon: Minus, label: "Moderate" },
  weak: { color: "bg-red-100 text-red-800", icon: TrendingDown, label: "Weak" },
};

export function AnalysisView({ caseId, caseData }: AnalysisViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const latestAnalysis = caseData.analyses[0];

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/analyze`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Analysis failed");
      }
      toast.success("Legal analysis complete");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // Show generate button if no analysis or user wants to re-run
  if (!latestAnalysis || loading) {
    return (
      <Card className="flex flex-col items-center justify-center py-16">
        <CardContent className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <Brain className="h-8 w-8 text-primary" />
            )}
          </div>
          <h3 className="text-lg font-semibold">
            {loading ? "Analyzing your case..." : "Generate Legal Analysis"}
          </h3>
          <p className="mb-6 mt-1 max-w-md text-sm text-muted-foreground">
            {loading
              ? "AI is mapping your facts to legal elements, assessing claim strength, and identifying vulnerabilities."
              : "Our AI will map your facts to legal elements, assess claim strength, identify vulnerabilities, and evaluate dismissal risk under Iqbal/Twombly standards."}
          </p>
          {!loading && (
            <Button onClick={handleAnalyze} size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Analysis
            </Button>
          )}
          {loading && (
            <div className="mx-auto max-w-md space-y-2 text-left">
              <LoadingStep text="Mapping facts to legal elements" />
              <LoadingStep text="Assessing claim strength" />
              <LoadingStep text="Identifying vulnerabilities" />
              <LoadingStep text="Evaluating dismissal risk" />
              <LoadingStep text="Finding supporting precedent" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const elementMapping = latestAnalysis.elementMapping as Array<{
    claim: string;
    elements: Array<{
      element: string;
      status: string;
      supportingFacts: string[];
      gaps: string[];
    }>;
  }>;
  const strengths = latestAnalysis.strengths as string[];
  const vulnerabilities = latestAnalysis.vulnerabilities as string[];
  const citedCases = latestAnalysis.citedCases as Array<{
    citation: string;
    summary: string;
    relevance: string;
  }>;
  const proceduralChecklist = latestAnalysis.proceduralChecklist as Array<{
    requirement: string;
    met: boolean;
    notes: string;
  }>;
  const riskConfig = RISK_CONFIG[latestAnalysis.dismissalRisk as keyof typeof RISK_CONFIG] ?? RISK_CONFIG.medium;
  const strengthConfig = STRENGTH_CONFIG[latestAnalysis.claimStrength as keyof typeof STRENGTH_CONFIG] ?? STRENGTH_CONFIG.moderate;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${strengthConfig.color}`}>
                <strengthConfig.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Claim Strength</p>
                <p className="text-lg font-bold">{strengthConfig.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${riskConfig.color}`}>
                <riskConfig.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dismissal Risk</p>
                <p className="text-lg font-bold">{riskConfig.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cited Cases</p>
                <p className="text-lg font-bold">{citedCases?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk reasoning */}
      {latestAnalysis.riskReasoning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Dismissal Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {latestAnalysis.riskReasoning}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Element mapping */}
      {elementMapping && (
        <Card>
          <CardHeader>
            <CardTitle>Element-by-Element Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {elementMapping.map((claim, ci) => (
              <div key={ci} className="rounded-lg border p-4">
                <h4 className="mb-3 font-semibold">{claim.claim}</h4>
                <div className="space-y-2">
                  {claim.elements?.map((el, ei) => (
                    <div key={ei} className="flex items-start gap-3">
                      {el.status === "satisfied" ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      ) : el.status === "partially_supported" ? (
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{el.element}</p>
                        <Badge
                          variant="outline"
                          className={`mt-1 text-xs ${
                            el.status === "satisfied"
                              ? "border-green-500 text-green-700"
                              : el.status === "partially_supported"
                                ? "border-amber-500 text-amber-700"
                                : "border-red-500 text-red-700"
                          }`}
                        >
                          {el.status.replace(/_/g, " ")}
                        </Badge>
                        {el.supportingFacts?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                              Supporting facts:
                            </p>
                            {el.supportingFacts.map((f, fi) => (
                              <p key={fi} className="text-xs text-muted-foreground">
                                • {f}
                              </p>
                            ))}
                          </div>
                        )}
                        {el.gaps?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium text-red-600">
                              Gaps:
                            </p>
                            {el.gaps.map((g, gi) => (
                              <p key={gi} className="text-xs text-red-600">
                                • {g}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Strengths & Vulnerabilities */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" /> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strengths?.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" /> Vulnerabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {vulnerabilities?.map((v, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  {v}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Cited cases */}
      {citedCases && citedCases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Supporting Precedent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {citedCases.map((c, i) => (
              <div key={i} className="rounded-lg border p-3">
                <p className="font-medium italic">{c.citation}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.summary}</p>
                <p className="mt-1 text-xs text-primary">{c.relevance}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Procedural checklist */}
      {proceduralChecklist && proceduralChecklist.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Procedural Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {proceduralChecklist.map((p, i) => (
              <div key={i} className="flex items-start gap-3">
                {p.met ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                ) : (
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                )}
                <div>
                  <p className="font-medium">{p.requirement}</p>
                  {p.notes && (
                    <p className="text-sm text-muted-foreground">{p.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleAnalyze} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Re-run Analysis
        </Button>
      </div>
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
