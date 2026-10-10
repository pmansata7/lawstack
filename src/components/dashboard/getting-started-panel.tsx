"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Check,
  Circle,
  FolderOpen,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { getAuthFetchHeaders } from "@/lib/auth/auth-fetch-headers";
import type { OnboardingStepView } from "@/lib/onboarding/state";
import { toast } from "sonner";

type OnboardingPayload = {
  showPanel: boolean;
  steps: OnboardingStepView[];
};

const STEP_ICONS: Record<string, typeof Brain> = {
  configure_ai: Brain,
  open_matter: FolderOpen,
  build_record: Sparkles,
  run_analysis: Brain,
};

export function GettingStartedPanel({ welcome }: { welcome?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showWelcome = welcome || searchParams.get("welcome") === "1";

  const [loading, setLoading] = useState(true);
  const [exampleLoading, setExampleLoading] = useState(false);
  const [data, setData] = useState<OnboardingPayload | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthFetchHeaders();
      const res = await fetch("/api/onboarding", {
        credentials: "same-origin",
        headers,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to load onboarding");
      }
      setData(json);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dismiss = async () => {
    try {
      const headers = await getAuthFetchHeaders();
      await fetch("/api/onboarding", {
        method: "PATCH",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({ dismiss: true }),
      });
      setData((prev) => (prev ? { ...prev, showPanel: false } : prev));
    } catch {
      toast.error("Could not dismiss checklist");
    }
  };

  const loadExampleMatter = async () => {
    setExampleLoading(true);
    try {
      const headers = await getAuthFetchHeaders();
      const res = await fetch("/api/onboarding/example-case", {
        method: "POST",
        credentials: "same-origin",
        headers,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to create example");
      }
      toast.success("Example matter ready", {
        description: "Explore facts, analysis, and draft on a pre-built record.",
      });
      router.push(`/cases/${json.caseId}/facts`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load example");
    } finally {
      setExampleLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!data?.showPanel) {
    if (!showWelcome) return null;
    return (
      <div className="mb-8 rounded-md border border-navy-950/10 bg-tint px-5 py-4">
        <p className="font-serif text-lg font-semibold text-navy-950">
          Welcome to Lawstack
        </p>
        <p className="mt-1 text-sm text-ink-600">
          Open a matter from the narrative intake, or load the example case anytime
          from{" "}
          <Link href="/dashboard/cases/new" className="font-medium underline">
            New Case
          </Link>
          .
        </p>
      </div>
    );
  }

  const doneCount = data.steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / data.steps.length) * 100);

  return (
    <section className="mb-8 border border-navy-950/10 bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-navy-950/10 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            Getting started
          </p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-navy-950">
            {showWelcome ? "Welcome—your workspace is ready" : "Finish setup"}
          </h2>
          <p className="mt-1 text-sm text-ink-600">
            Four steps to your first export-ready pleading. Most teams start with
            the example matter, then swap in a real client narrative.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-ink-500"
          onClick={dismiss}
          aria-label="Dismiss getting started"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <Progress value={pct} className="flex-1" />
          <span className="font-mono text-xs text-ink-500">
            {doneCount}/{data.steps.length}
          </span>
        </div>

        <ol className="space-y-2">
          {data.steps.map((step) => {
            const Icon = STEP_ICONS[step.id] ?? Circle;
            return (
              <li
                key={step.id}
                className="flex gap-3 rounded-md border border-navy-950/8 px-3 py-3"
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center ${
                    step.done ? "bg-navy-950 text-white" : "bg-tint text-ink-500"
                  }`}
                >
                  {step.done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy-950">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-600">
                    {step.description}
                  </p>
                  {!step.done && step.id === "open_matter" && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button size="sm" asChild>
                        <Link href="/dashboard/cases/new">New case</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        disabled={exampleLoading}
                        onClick={loadExampleMatter}
                      >
                        {exampleLoading && (
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        )}
                        Load example matter
                      </Button>
                    </div>
                  )}
                  {!step.done &&
                    step.id !== "open_matter" &&
                    step.href.startsWith("/") && (
                      <Button size="sm" variant="link" className="mt-1 h-auto p-0" asChild>
                        <Link href={step.href}>Go to step</Link>
                      </Button>
                    )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
