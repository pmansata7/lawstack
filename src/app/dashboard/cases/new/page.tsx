"use client";

import { useMemo, useState } from "react";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  CLAIM_TEMPLATES,
  getClaimTemplatesForCourtType,
  getCourtTypeLabel,
  getJurisdictionGroups,
  isSmallClaimsJurisdiction,
  resolveCourtType,
  type CaseCourtType,
  type ClaimTemplate,
} from "@/lib/legal/claim-templates";
import { getAuthFetchHeaders } from "@/lib/auth/auth-fetch-headers";
import { NarrativeIntakeCard } from "@/components/ai/narrative-intake-card";
import { CASE_INTAKE_SAMPLE_PROMPTS } from "@/lib/ai/case-intake-sample-prompts";

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
  const [claimSearch, setClaimSearch] = useState("");

  const effectiveCourtType = resolveCourtType(
    caseData.courtType,
    caseData.jurisdiction,
  );
  const jurisdictionGroups = getJurisdictionGroups(caseData.courtType);
  const availableClaims = getClaimTemplatesForCourtType(effectiveCourtType);
  const filteredClaims = useMemo(() => {
    const q = claimSearch.trim().toLowerCase();
    if (!q) return availableClaims;
    return availableClaims.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.elements.some((e) => e.element.toLowerCase().includes(q)),
    );
  }, [availableClaims, claimSearch]);

  const enableSmallClaims = () => {
    setCaseData({
      ...caseData,
      courtType: "SMALL_CLAIMS",
      jurisdiction: caseData.jurisdiction || "ca-small-claims",
    });
    setSelectedClaims([]);
    setClaimSearch("");
    setStep("case");
    toast.message("Small claims enabled", {
      description:
        "Court type is set to Small Claims Court. Confirm your jurisdiction, then continue to Define Claims.",
    });
  };

  const handleAiCaseIntake = async (narrative: string) => {
    const headers = await getAuthFetchHeaders();
    const res = await fetch("/api/ai/case-intake", {
      method: "POST",
      credentials: "same-origin",
      headers,
      body: JSON.stringify({ narrative }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error ?? "AI intake failed");
    }

    const s = data.suggestion as {
      title: string;
      courtType: CaseCourtType;
      jurisdiction: string;
      courtName: string;
      caseNumber: string;
      plaintiff: string;
      defendant: string;
      opposingParty: string;
      claimTypes: string[];
      notes: string;
    };

    setCaseData((prev) => ({
      ...prev,
      title: s.title || prev.title,
      courtType: s.courtType || prev.courtType,
      jurisdiction: s.jurisdiction || prev.jurisdiction,
      courtName: s.courtName || prev.courtName,
      caseNumber: s.caseNumber || prev.caseNumber,
      plaintiff: s.plaintiff || prev.plaintiff,
      defendant: s.defendant || prev.defendant,
      opposingParty: s.opposingParty || prev.opposingParty,
    }));

    const courtForClaims = resolveCourtType(
      s.courtType || caseData.courtType,
      s.jurisdiction || caseData.jurisdiction,
    );
    const allowed = new Set(
      getClaimTemplatesForCourtType(courtForClaims).map((c) => c.type),
    );
    const claims = s.claimTypes
      .map((type) => CLAIM_TEMPLATES.find((c) => c.type === type))
      .filter((c): c is ClaimTemplate => Boolean(c && allowed.has(c.type)));

    if (claims.length > 0) {
      setSelectedClaims(claims);
    }

    toast.success("AI filled case details", {
      description: s.notes || "Review fields and claims before creating the case.",
    });
    if (claims.length > 0) {
      setStep("claims");
    }
  };

  const handleJurisdictionChange = (value: string | null) => {
    const jurisdiction = value ?? "";
    let courtType = caseData.courtType;
    if (isSmallClaimsJurisdiction(jurisdiction)) {
      courtType = "SMALL_CLAIMS";
    } else if (courtType === "SMALL_CLAIMS") {
      courtType = "STATE";
    }
    setCaseData({ ...caseData, jurisdiction, courtType });
    setSelectedClaims([]);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const headers = await getAuthFetchHeaders();
      const res = await fetch("/api/cases", {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({
          ...caseData,
          courtType: effectiveCourtType,
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
            <NarrativeIntakeCard
              title="AI case intake"
              description="Paste a short summary of the dispute. AI will suggest the caption, court, jurisdiction, parties, and claims."
              placeholder="Example: My landlord kept my $2,000 security deposit after I moved out of my Oakland apartment. I left the unit clean on March 1, 2025, but they never returned the deposit or sent an itemized statement."
              samplePrompts={CASE_INTAKE_SAMPLE_PROMPTS}
              onGenerate={async (narrative) => {
                try {
                  await handleAiCaseIntake(narrative);
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : "AI intake failed",
                  );
                }
              }}
            />

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
                <p className="text-xs text-muted-foreground">
                  Choose <span className="font-medium">Small Claims Court</span>{" "}
                  or pick a small claims jurisdiction under State Court.
                </p>
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
                  <SelectTrigger id="courtType" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMALL_CLAIMS">Small Claims Court</SelectItem>
                    <SelectItem value="STATE">State Court</SelectItem>
                    <SelectItem value="FEDERAL">Federal Court</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Select
                  value={caseData.jurisdiction}
                  onValueChange={handleJurisdictionChange}
                >
                  <SelectTrigger id="jurisdiction" className="w-full">
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {jurisdictionGroups.map((group) => (
                      <SelectGroup key={group.label}>
                        <SelectLabel>{group.label}</SelectLabel>
                        {group.options.map((j) => (
                          <SelectItem key={j.value} value={j.value}>
                            {j.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
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
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                Court: {getCourtTypeLabel(effectiveCourtType)}
              </Badge>
              {caseData.jurisdiction && (
                <Badge variant="secondary" className="max-w-full truncate">
                  {jurisdictionGroups
                    .flatMap((g) => g.options)
                    .find((j) => j.value === caseData.jurisdiction)?.label ??
                    caseData.jurisdiction}
                </Badge>
              )}
            </div>

            {effectiveCourtType !== "SMALL_CLAIMS" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                <p className="font-medium">Small claims not showing?</p>
                <p className="mt-1 text-pretty">
                  Standard civil claims (like Nuisance and Trespass) appear for
                  federal and general state courts. For small claims templates
                  (Money Owed, Security Deposit, etc.), enable small claims
                  below or go back and choose{" "}
                  <span className="font-medium">Small Claims Court</span>.
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  variant="secondary"
                  onClick={enableSmallClaims}
                >
                  Use small claims court
                </Button>
              </div>
            )}

            {effectiveCourtType === "SMALL_CLAIMS" && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
                Small claims templates are shown first (category{" "}
                <span className="font-medium">Small Claims</span>). Search below
                if you do not see the one you need.
              </div>
            )}

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
              <Label htmlFor="claimSearch">Available Claim Types</Label>
              <Input
                id="claimSearch"
                placeholder="Search claims (e.g. small claims, deposit, money owed)"
                value={claimSearch}
                onChange={(e) => setClaimSearch(e.target.value)}
              />
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {filteredClaims.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No claims match your search.
                    {effectiveCourtType !== "SMALL_CLAIMS" &&
                      ' Try "Use small claims court" above for small claims templates.'}
                  </p>
                )}
                {filteredClaims.map((c) => {
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
