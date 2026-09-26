"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";
import { Brain, Loader2, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const PROVIDERS = [
  {
    value: "openai",
    label: "OpenAI (GPT-4o, GPT-4 Turbo)",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-preview"],
  },
  {
    value: "anthropic",
    label: "Anthropic Claude (Claude 3.5 Sonnet, Opus)",
    models: [
      "claude-sonnet-4-20250514",
      "claude-3-5-sonnet-20241022",
      "claude-3-opus-20240229",
      "claude-3-haiku-20240307",
    ],
  },
  {
    value: "bedrock",
    label: "AWS Bedrock (Claude, Llama, etc.)",
    models: [
      "anthropic.claude-3-5-sonnet-20241022-v2:0",
      "anthropic.claude-3-opus-20240229-v1:0",
      "meta.llama3-70b-instruct-v1:0",
    ],
  },
];

export function AiSettingsForm({
  initialSettings,
}: {
  initialSettings: {
    provider: string;
    model: string;
    analysisModel: string;
    draftingModel: string;
    temperature: number;
    hasApiKey: boolean;
  };
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentProvider = PROVIDERS.find((p) => p.value === settings.provider);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/ai", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          apiKey: apiKey || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("AI settings saved");
      setApiKey("");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Provider Configuration
          </CardTitle>
          <CardDescription>
            Choose your AI provider and configure API access. All providers
            support legal analysis and complaint drafting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={settings.provider}
              onValueChange={(v: string | null) =>
                setSettings({
                  ...settings,
                  provider: v ?? "openai",
                  model: PROVIDERS.find((p) => p.value === v)?.models[0] ?? "",
                })
              }
            >
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">
              API Key{" "}
              {settings.hasApiKey && (
                <span className="text-xs text-green-600">
                  (configured — enter new key to replace)
                </span>
              )}
            </Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                placeholder={settings.hasApiKey ? "••••••••••••" : "sk-..."}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is stored encrypted and never shared.
            </p>
          </div>

          <Separator />

          {/* Default Model */}
          <div className="space-y-2">
            <Label htmlFor="model">Default Model</Label>
            <Select
              value={settings.model}
              onValueChange={(v: string | null) => setSettings({ ...settings, model: v ?? "" })}
            >
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currentProvider?.models.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature">
              Temperature: {settings.temperature.toFixed(1)}
            </Label>
            <Input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.temperature}
              onChange={(e) =>
                setSettings({ ...settings, temperature: parseFloat(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground">
              Lower = more precise and consistent. Higher = more creative.
            </p>
          </div>

          <Separator />

          {/* Per-task model routing */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Per-Task Model Routing (optional)</p>
              <p className="text-xs text-muted-foreground">
                Use different models for analysis vs drafting.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="analysisModel">Analysis Model</Label>
              <Input
                id="analysisModel"
                placeholder="Same as default"
                value={settings.analysisModel}
                onChange={(e) =>
                  setSettings({ ...settings, analysisModel: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="draftingModel">Drafting Model</Label>
              <Input
                id="draftingModel"
                placeholder="Same as default"
                value={settings.draftingModel}
                onChange={(e) =>
                  setSettings({ ...settings, draftingModel: e.target.value })
                }
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
