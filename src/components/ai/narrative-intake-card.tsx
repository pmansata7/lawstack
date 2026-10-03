"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

export type NarrativeSamplePrompt = {
  label: string;
  text: string;
};

type NarrativeIntakeCardProps = {
  title: string;
  description: string;
  placeholder: string;
  minLength?: number;
  /** When true, submit is allowed even if narrative is shorter than minLength. */
  allowSubmitWithoutMinNarrative?: boolean;
  submitLabel?: string;
  secondarySubmitLabel?: string;
  samplePrompts?: NarrativeSamplePrompt[];
  uploadedDocumentCount?: number;
  onGenerate: (narrative: string) => Promise<void>;
  onSecondaryGenerate?: (narrative: string) => Promise<void>;
};

export function NarrativeIntakeCard({
  title,
  description,
  placeholder,
  minLength = 20,
  allowSubmitWithoutMinNarrative = false,
  submitLabel = "Fill with AI",
  secondarySubmitLabel,
  samplePrompts,
  uploadedDocumentCount = 0,
  onGenerate,
  onSecondaryGenerate,
}: NarrativeIntakeCardProps) {
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState<"primary" | "secondary" | null>(
    null,
  );

  const narrativeOk =
    narrative.trim().length >= minLength || allowSubmitWithoutMinNarrative;

  const runGenerate = async (mode: "primary" | "secondary") => {
    if (!narrativeOk) return;
    setLoading(true);
    setLoadingMode(mode);
    try {
      if (mode === "secondary" && onSecondaryGenerate) {
        await onSecondaryGenerate(narrative.trim());
      } else {
        await onGenerate(narrative.trim());
      }
    } finally {
      setLoading(false);
      setLoadingMode(null);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/[0.03]">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          {uploadedDocumentCount > 0 && (
            <Badge variant="secondary" className="shrink-0">
              {uploadedDocumentCount} doc
              {uploadedDocumentCount === 1 ? "" : "s"} will be analyzed
            </Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {samplePrompts && samplePrompts.length > 0 && (
          <div className="space-y-2">
            <Label>Sample prompts</Label>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((prompt) => (
                <Button
                  key={prompt.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto whitespace-normal py-1.5 text-left text-xs"
                  disabled={loading}
                  onClick={() => setNarrative(prompt.text)}
                >
                  {prompt.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Click a sample to fill instructions, then generate for review.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="ai-narrative">Case details & instructions</Label>
          <Textarea
            id="ai-narrative"
            rows={5}
            placeholder={placeholder}
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            {uploadedDocumentCount > 0
              ? "All uploaded documents are included automatically when you generate."
              : "Upload documents below, or describe the case in at least a few sentences."}{" "}
            AI uses your org provider from{" "}
            <Link
              href="/settings/ai"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Settings → AI
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => runGenerate("primary")}
            disabled={loading || !narrativeOk}
          >
            {loading && loadingMode === "primary" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {submitLabel}
          </Button>
          {onSecondaryGenerate && secondarySubmitLabel && (
            <Button
              type="button"
              variant="outline"
              onClick={() => runGenerate("secondary")}
              disabled={loading || !narrativeOk}
            >
              {loading && loadingMode === "secondary" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {secondarySubmitLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
