"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2, Gavel } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ClaimElement {
  element: string;
  description: string;
  satisfied: boolean;
}

interface Claim {
  id: string;
  claimType: string;
  elements: unknown;
}

export function LegalElementsTab({
  caseId,
  claims,
}: {
  caseId: string;
  claims: Claim[];
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggle = async (claimId: string, elementIndex: number) => {
    setUpdating(`${claimId}-${elementIndex}`);
    try {
      const res = await fetch(`/api/cases/${caseId}/claims/${claimId}/elements`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elementIndex }),
      });
      if (!res.ok) throw new Error("Failed to update element");
      toast.success("Element updated");
      router.refresh();
    } catch {
      toast.error("Failed to update element");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Mark each legal element as satisfied when you have facts and evidence
          to support it. This checklist guides your fact organization and feeds
          into the AI legal analysis.
        </p>
      </div>

      {claims.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No claims defined for this case. Add claims during case setup.
          </CardContent>
        </Card>
      ) : (
        claims.map((claim) => {
          const elements = claim.elements as ClaimElement[];
          const satisfiedCount = elements?.filter((e) => e.satisfied).length ?? 0;
          const totalCount = elements?.length ?? 0;

          return (
            <Card key={claim.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gavel className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">
                      {claim.claimType}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {satisfiedCount}/{totalCount} satisfied
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {elements?.map((el, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggle(claim.id, idx)}
                        disabled={updating === `${claim.id}-${idx}`}
                        className="mt-0.5"
                      >
                        {updating === `${claim.id}-${idx}` ? (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : el.satisfied ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </button>
                      <div>
                        <p className="font-medium">{el.element}</p>
                        <p className="text-sm text-muted-foreground">
                          {el.description}
                        </p>
                      </div>
                    </div>
                    {el.satisfied && (
                      <Badge className="bg-green-100 text-green-800">
                        Satisfied
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
