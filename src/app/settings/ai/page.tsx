import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AiSettingsForm } from "@/components/settings/ai-settings-form";

export default async function AiSettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const settings = await prisma.aiSetting.findUnique({
    where: { organizationId: session.orgId },
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Provider Settings</h1>
        <p className="text-muted-foreground">
          Configure your AI provider for case intake, facts organization, legal
          analysis, and complaint drafting.
        </p>
      </div>

      <AiSettingsForm
        initialSettings={{
          provider: settings?.provider ?? "openai",
          model: settings?.model ?? "gpt-4o",
          analysisModel: settings?.analysisModel ?? "",
          draftingModel: settings?.draftingModel ?? "",
          temperature: settings?.temperature ?? 0.7,
          hasApiKey: !!settings?.apiKey,
        }}
      />
    </div>
  );
}
