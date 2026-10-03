"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FactsTab } from "@/components/cases/facts-tab";
import { TimelineTab } from "@/components/cases/timeline-tab";
import { DocumentsTab } from "@/components/cases/documents-tab";
import { WitnessesTab } from "@/components/cases/witnesses-tab";
import { DamagesTab } from "@/components/cases/damages-tab";
import { LegalElementsTab } from "@/components/cases/legal-elements-tab";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { NarrativeIntakeCard } from "@/components/ai/narrative-intake-card";
import { EvidenceUploadZone } from "@/components/cases/evidence-upload-zone";
import { FactsIntakeReviewDialog } from "@/components/cases/facts-intake-review-dialog";
import { FACTS_INTAKE_SAMPLE_PROMPTS } from "@/lib/ai/facts-intake-sample-prompts";
import type { FactsIntakeSuggestion } from "@/lib/ai/intake-schemas";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAuthFetchHeaders } from "@/lib/auth/auth-fetch-headers";

interface FactsTabsProps {
  caseId: string;
  initialData: {
    id: string;
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
      source: string | null;
    }>;
    evidence: Array<{
      id: string;
      title: string;
      type: string;
      fileName: string | null;
      fileUrl: string | null;
    }>;
    timeline: Array<{
      id: string;
      date: Date;
      title: string;
      description: string | null;
    }>;
    witnesses: Array<{
      id: string;
      name: string;
      contact: string | null;
      statement: string | null;
      credibility: string | null;
    }>;
    damages: Array<{
      id: string;
      category: string;
      amount: number;
      description: string | null;
    }>;
  };
}

type IntakeDocumentsMeta = {
  total: number;
  withExtractedText: number;
};

export function FactsTabs({ caseId, initialData }: FactsTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("facts");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] =
    useState<FactsIntakeSuggestion | null>(null);
  const [pendingDocuments, setPendingDocuments] =
    useState<IntakeDocumentsMeta | null>(null);

  const factCount = initialData.facts.length;
  const docCount = initialData.evidence.length;
  const witnessCount = initialData.witnesses.length;
  const damageTotal = initialData.damages.reduce(
    (sum, d) => sum + d.amount,
    0,
  );

  const requestIntake = async (
    narrative: string,
    options: { apply: boolean; suggestion?: FactsIntakeSuggestion },
  ) => {
    const headers = await getAuthFetchHeaders();
    const res = await fetch(`/api/cases/${caseId}/ai-intake`, {
      method: "POST",
      credentials: "same-origin",
      headers,
      body: JSON.stringify({
        narrative,
        apply: options.apply,
        includeDocuments: !options.suggestion,
        ...(options.suggestion ? { suggestion: options.suggestion } : {}),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "AI intake failed");
    }
    return data as {
      suggestion: FactsIntakeSuggestion;
      applied?: {
        facts: number;
        timeline: number;
        witnesses: number;
        damages: number;
      };
      documents?: IntakeDocumentsMeta;
    };
  };

  const handleGenerateForReview = async (narrative: string) => {
    const data = await requestIntake(narrative, { apply: false });
    setPendingSuggestion(data.suggestion);
    setPendingDocuments(data.documents ?? null);
    setReviewOpen(true);
  };

  const handleApplyFromReview = async () => {
    if (!pendingSuggestion) return;
    setApplying(true);
    try {
      const data = await requestIntake("", {
        apply: true,
        suggestion: pendingSuggestion,
      });
      const applied = data.applied!;
      const docs = pendingDocuments;
      const docNote =
        docs && docs.total > 0
          ? ` From ${docs.total} uploaded document${docs.total === 1 ? "" : "s"}.`
          : "";
      toast.success("Added to case — review your facts", {
        description: `${applied.facts} facts, ${applied.timeline} timeline entries, ${applied.witnesses} witnesses, ${applied.damages} damages.${docNote}`,
      });
      setReviewOpen(false);
      setPendingSuggestion(null);
      setActiveTab("facts");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add to case");
    } finally {
      setApplying(false);
    }
  };

  const handleAddDirectly = async (narrative: string) => {
    const data = await requestIntake(narrative, { apply: true });
    const applied = data.applied!;
    const docs = data.documents;
    const docNote =
      docs && docs.total > 0
        ? ` Analyzed ${docs.total} uploaded document${docs.total === 1 ? "" : "s"}.`
        : "";
    toast.success("AI added case details", {
      description: `${applied.facts} facts, ${applied.timeline} timeline entries, ${applied.witnesses} witnesses, ${applied.damages} damage items.${docNote}`,
    });
    setActiveTab("facts");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <EvidenceUploadZone
        caseId={caseId}
        onUploaded={() => router.refresh()}
      />

      <NarrativeIntakeCard
        title="AI fill facts & evidence"
        description="Upload documents first, pick a sample prompt or add instructions, then generate for review. AI reads every uploaded file to build facts, timeline, witnesses, and damages."
        placeholder="Optional: e.g. focus on repair timeline and warranty claims. Leave blank if the sample prompt or uploads alone are enough."
        samplePrompts={FACTS_INTAKE_SAMPLE_PROMPTS}
        uploadedDocumentCount={docCount}
        allowSubmitWithoutMinNarrative={docCount > 0}
        minLength={docCount > 0 ? 0 : 20}
        submitLabel="Generate for review"
        secondarySubmitLabel="Add to case without review"
        onGenerate={async (narrative) => {
          try {
            await handleGenerateForReview(narrative);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "AI intake failed");
          }
        }}
        onSecondaryGenerate={async (narrative) => {
          try {
            await handleAddDirectly(narrative);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "AI intake failed");
          }
        }}
      />

      <FactsIntakeReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        suggestion={pendingSuggestion}
        documents={pendingDocuments ?? undefined}
        applying={applying}
        onConfirm={handleApplyFromReview}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="facts">
            Facts ({factCount})
          </TabsTrigger>
          <TabsTrigger value="timeline">
            Timeline ({initialData.timeline.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({docCount})
          </TabsTrigger>
          <TabsTrigger value="witnesses">
            Witnesses ({witnessCount})
          </TabsTrigger>
          <TabsTrigger value="damages">
            Damages ({initialData.damages.length})
          </TabsTrigger>
          <TabsTrigger value="elements">
            Legal Elements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="facts">
          <FactsTab caseId={caseId} initialFacts={initialData.facts} />
        </TabsContent>
        <TabsContent value="timeline">
          <TimelineTab caseId={caseId} initialTimeline={initialData.timeline} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab caseId={caseId} initialEvidence={initialData.evidence} />
        </TabsContent>
        <TabsContent value="witnesses">
          <WitnessesTab
            caseId={caseId}
            initialWitnesses={initialData.witnesses}
          />
        </TabsContent>
        <TabsContent value="damages">
          <DamagesTab
            caseId={caseId}
            initialDamages={initialData.damages}
            total={damageTotal}
          />
        </TabsContent>
        <TabsContent value="elements">
          <LegalElementsTab caseId={caseId} claims={initialData.claims} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button asChild>
          <Link href={`/cases/${caseId}/analysis`}>
            Continue to Legal Analysis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
