"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  getClaimTemplatesForCourtType,
  getJurisdictionsForCourtType,
  type CaseCourtType,
  type ClaimTemplate,
} from "@/lib/legal/claim-templates";

type Step = "case" | "claims";

export default function NewCasePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("case");
  const [loading, setLoading] = useState(false);

  const [caseData, setCaseData] = useState({
    title: "",
    courtType: "FEDERAL" as CaseCourtType,
    jurisdiction: "",
    courtName: "",
    caseNumber: "",
    plaintiff: "",
    defendant: "",
    opposingParty: "",
  });

  const [selectedClaims, setSelectedClaims] = useState<ClaimTemplate[]>([]);

  const jurisdictions = getJurisdictionsForCourtType(caseData.courtType);
  const availableClaims = getClaimTemplatesForCourtType(caseData.courtType);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...caseData,
          claims: selectedClaims.map((c) => ({
            claimType: c.type,
            jurisdiction: caseData.jurisdiction,
            elements: c.elements.map((e) => ({
              element: e.element,
              description: e.description,
              satisfied: false,
            })),
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create case");
      }

      const { caseId } = await res.json();
      toast.success("Case created successfully");
      router.push(`/cases/${caseId}/setup`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create case");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "case" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            1
          </div>
          <span className={step === "case" ? "font-medium" : "text-muted-foreground"}>
            Case Details
          </span>
        </div>
        <div className="h-px flex-1 bg-border" />
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "claims" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            2
          </div>
          <span className={step === "claims" ? "font-medium" : "text-muted-foreground"}>
            Define Claims
          </span>
        </div>
      </div>

      {step === "case" && (
        <Card>
          <CardHeader>
            <CardTitle>Set up your case</CardTitle>
            <CardDescription>
              Enter key details, choose jurisdiction, and define your claims.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Case Title *</Label>
              <Input
                id="title"
                placeholder="Smith v. Acme Corp."
                value={caseData.title}
                onChange={(e) =>
                  setCaseData({ ...caseData, title: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="courtType">Court Type</Label>
                <Select
                  value={caseData.courtType}
                  onValueChange={(v: string | null) => {
                    setCaseData({
                      ...caseData,
                      courtType: (v ?? "FEDERAL") as CaseCourtType,
                      jurisdiction: "",
                    });
                    setSelectedClaims([]);
                  }}
                >
                  <SelectTrigger id="courtType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEDERAL">Federal Court</SelectItem>
                    <SelectItem value="STATE">State Court</SelectItem>
                    <SelectItem value="SMALL_CLAIMS">Small Claims Court</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Select
                  value={caseData.jurisdiction}
                  onValueChange={(v: string | null) =>
                    setCaseData({ ...caseData, jurisdiction: v ?? "" })
                  }
                >
                  <SelectTrigger id="jurisdiction">
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {jurisdictions.map((j) => (
                      <SelectItem key={j.value} value={j.value}>
                        {j.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plaintiff">Plaintiff</Label>
                <Input
                  id="plaintiff"
                  placeholder="John Smith"
                  value={caseData.plaintiff}
                  onChange={(e) =>
                    setCaseData({ ...caseData, plaintiff: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defendant">Defendant</Label>
                <Input
                  id="defendant"
                  placeholder="Acme Corporation"
                  value={caseData.defendant}
                  onChange={(e) =>
                    setCaseData({ ...caseData, defendant: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="courtName">Court Name (optional)</Label>
                <Input
                  id="courtName"
                  placeholder="U.S. District Court"
                  value={caseData.courtName}
                  onChange={(e) =>
                    setCaseData({ ...caseData, courtName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caseNumber">Case Number (optional)</Label>
                <Input
                  id="caseNumber"
                  placeholder="2:24-cv-01234"
                  value={caseData.caseNumber}
                  onChange={(e) =>
                    setCaseData({ ...caseData, caseNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setStep("claims")}
                disabled={!caseData.title || !caseData.jurisdiction}
              >
                Next: Define Claims
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "claims" && (
        <Card>
          <CardHeader>
            <CardTitle>Define your claims</CardTitle>
            <CardDescription>
              Select the causes of action for this case. Each claim has
              pre-built legal elements that will guide your fact organization.
              {caseData.courtType === "SMALL_CLAIMS" &&
                " Small claims templates are tailored to common limited-jurisdiction disputes."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected claims */}
            {selectedClaims.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Claims</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedClaims.map((c) => (
                    <Badge
                      key={c.type}
                      variant="secondary"
                      className="flex items-center gap-1 py-1.5 pl-3 pr-1"
                    >
                      {c.label}
                      <button
                        onClick={() =>
                          setSelectedClaims(
                            selectedClaims.filter((s) => s.type !== c.type),
                          )
                        }
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Available claims */}
            <div className="space-y-2">
              <Label>Available Claim Types</Label>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {availableClaims.map((c) => {
                  const isSelected = selectedClaims.some(
                    (s) => s.type === c.type,
                  );
                  return (
                    <div
                      key={c.type}
                      className={`rounded-lg border p-3 transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{c.label}</h4>
                            <Badge variant="outline" className="text-xs">
                              {c.category}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {c.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {c.elements.map((e) => (
                              <span
                                key={e.element}
                                className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                              >
                                {e.element}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={isSelected ? "secondary" : "outline"}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedClaims(
                                selectedClaims.filter((s) => s.type !== c.type),
                              );
                            } else {
                              setSelectedClaims([...selectedClaims, c]);
                            }
                          }}
                        >
                          {isSelected ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("case")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Case
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
