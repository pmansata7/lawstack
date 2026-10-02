"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

type NarrativeIntakeCardProps = {
  title: string;
  description: string;
  placeholder: string;
  minLength?: number;
  submitLabel?: string;
  onGenerate: (narrative: string) => Promise<void>;
};

export function NarrativeIntakeCard({
  title,
  description,
  placeholder,
  minLength = 20,
  submitLabel = "Fill with AI",
  onGenerate,
}: NarrativeIntakeCardProps) {
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (narrative.trim().length < minLength) return;
    setLoading(true);
    try {
      await onGenerate(narrative.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/[0.03]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="ai-narrative">Describe the situation</Label>
          <Textarea
            id="ai-narrative"
            rows={5}
            placeholder={placeholder}
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            AI uses your org provider from{" "}
            <Link href="/settings/ai" className="font-medium text-primary underline-offset-2 hover:underline">
              Settings → AI
            </Link>
            , or server environment keys.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading || narrative.trim().length < minLength}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {submitLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
