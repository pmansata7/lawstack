"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { getAuthFetchHeaders } from "@/lib/auth/auth-fetch-headers";

type IntakeQuestion = {
  id: string;
  prompt: string;
  whyItMatters?: string;
};

export function AdaptiveIntakePanel({ caseId }: { caseId: string }) {
  const [narrative, setNarrative] = useState("");
  const [questions, setQuestions] = useState<IntakeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    void (async () => {
      const headers = await getAuthFetchHeaders();
      const res = await fetch(`/api/cases/${caseId}/intake`, {
        credentials: "same-origin",
        headers,
      });
      if (!res.ok) return;
      const data = await res.json();
      const pending = (data.session?.pendingQuestions as IntakeQuestion[]) ?? [];
      setQuestions(pending);
      setComplete(data.session?.phase === "complete");
    })();
  }, [caseId]);

  const runTurn = async (payload: { narrative?: string; answer?: { questionId: string; answer: string } }) => {
    setLoading(true);
    try {
      const headers = await getAuthFetchHeaders();
      const res = await fetch(`/api/cases/${caseId}/intake`, {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Intake failed");
      setQuestions(data.nextQuestions ?? []);
      setComplete(Boolean(data.complete));
      if (data.complete) toast.success("Intake interview complete");
      else toast.message("Follow-up questions updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Intake failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 border border-navy-950/10 bg-white p-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-navy-950" />
        <h2 className="font-serif text-lg font-semibold text-navy-950">
          Adaptive intake interview
        </h2>
      </div>
      <p className="mt-1 text-sm text-ink-600">
        AI asks what an experienced litigator would—dates, jurisdiction facts, damages,
        and evidence—before you draft.
      </p>

      {!complete && questions.length === 0 && (
        <div className="mt-4 space-y-2">
          <Label htmlFor="adaptive-narrative">Start or refresh from narrative</Label>
          <Textarea
            id="adaptive-narrative"
            rows={4}
            placeholder="Paste the client story or summary of the dispute…"
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
          />
          <Button
            type="button"
            disabled={loading || narrative.trim().length < 20}
            onClick={() => runTurn({ narrative })}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate follow-up questions
          </Button>
        </div>
      )}

      {questions.length > 0 && !complete && (
        <div className="mt-4 space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="space-y-1">
              <Label>{q.prompt}</Label>
              {q.whyItMatters && (
                <p className="text-xs text-muted-foreground">{q.whyItMatters}</p>
              )}
              <Textarea
                rows={2}
                value={answers[q.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
              />
            </div>
          ))}
          <Button
            type="button"
            disabled={loading}
            onClick={() => {
              const first = questions.find((q) => (answers[q.id] ?? "").trim());
              if (!first) {
                toast.error("Answer at least one question");
                return;
              }
              void runTurn({
                answer: { questionId: first.id, answer: answers[first.id] },
              });
            }}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit answers
          </Button>
        </div>
      )}

      {complete && (
        <p className="mt-3 text-sm font-medium text-emerald-800">
          Material gaps addressed. Continue building the record below.
        </p>
      )}
    </div>
  );
}
