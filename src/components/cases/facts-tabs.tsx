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

export function FactsTabs({ caseId, initialData }: FactsTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("facts");

  const factCount = initialData.facts.length;
  const docCount = initialData.evidence.length;
  const witnessCount = initialData.witnesses.length;
  const damageTotal = initialData.damages.reduce(
    (sum, d) => sum + d.amount,
    0,
  );

  const handleAiFactsIntake = async (narrative: string) => {
    const headers = await getAuthFetchHeaders();
    const res = await fetch(`/api/cases/${caseId}/ai-intake`, {
      method: "POST",
      credentials: "same-origin",
      headers,
      body: JSON.stringify({ narrative, apply: true }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "AI intake failed");
    }

    const applied = data.applied as {
      facts: number;
      timeline: number;
      witnesses: number;
      damages: number;
    };
    toast.success("AI added case details", {
      description: `${applied.facts} facts, ${applied.timeline} timeline entries, ${applied.witnesses} witnesses, ${applied.damages} damage items.`,
    });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <NarrativeIntakeCard
        title="AI fill facts & evidence"
        description="Describe what happened in plain language. AI will add facts, timeline events, witnesses, and damages to this case (you can edit or delete anything afterward). Upload documents or folders below to attach files to the case."
        placeholder="Include dates, who did what, money amounts, witnesses, and documents if you know them."
        submitLabel="Generate & add to case"
        onGenerate={async (narrative) => {
          try {
            await handleAiFactsIntake(narrative);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "AI intake failed");
          }
        }}
      />

      <EvidenceUploadZone
        caseId={caseId}
        onUploaded={() => router.refresh()}
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
