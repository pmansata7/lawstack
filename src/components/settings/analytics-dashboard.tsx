"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getAuthFetchHeaders } from "@/lib/auth/auth-fetch-headers";

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState<{
    casesCreated: number;
    draftsGenerated: number;
    analysesRun: number;
    intakeCompleted: number;
    events: Array<{ name: string; count: number }>;
  } | null>(null);
  const [evalOutput, setEvalOutput] = useState<string | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      const headers = await getAuthFetchHeaders();
      const res = await fetch("/api/analytics/summary", { credentials: "same-origin", headers });
      if (res.ok) setSummary(await res.json());
    })();
  }, []);

  const runEval = async () => {
    setEvalLoading(true);
    try {
      const headers = await getAuthFetchHeaders();
      const res = await fetch("/api/evals/run", { method: "POST", credentials: "same-origin", headers });
      const data = await res.json();
      setEvalOutput(data.output ?? data.error ?? "No output");
    } finally {
      setEvalLoading(false);
    }
  };

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Cases (30d)" value={summary.casesCreated} />
        <MetricCard title="Analyses" value={summary.analysesRun} />
        <MetricCard title="Drafts" value={summary.draftsGenerated} />
        <MetricCard title="Intake completed" value={summary.intakeCompleted} />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Event breakdown</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <ul className="space-y-1">
            {summary.events.map((e) => (
              <li key={e.name} className="flex justify-between">
                <span className="font-mono text-xs">{e.name}</span>
                <span>{e.count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Eval harness</CardTitle>
          <Button size="sm" onClick={runEval} disabled={evalLoading}>
            {evalLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Run smoke eval
          </Button>
        </CardHeader>
        {evalOutput && (
          <CardContent>
            <pre className="max-h-48 overflow-auto rounded bg-muted p-3 text-xs">{evalOutput}</pre>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-serif text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
