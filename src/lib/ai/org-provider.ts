import { prisma } from "@/lib/prisma";
import {
  createAiProvider,
  getProviderFromEnv,
  type AiProvider,
  type IAiProvider,
} from "@/lib/ai/provider";

export class AiNotConfiguredError extends Error {
  constructor() {
    super(
      "AI is not configured. Add an API key in Settings → AI, or set OPENAI_API_KEY / ANTHROPIC_API_KEY in the server environment.",
    );
    this.name = "AiNotConfiguredError";
  }
}

function hasEnvAiCredentials(): boolean {
  const provider = (process.env.AI_PROVIDER ?? "openai") as AiProvider;
  if (provider === "bedrock") {
    return Boolean(
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY,
    );
  }
  return Boolean(
    process.env.OPENAI_API_KEY ?? process.env.ANTHROPIC_API_KEY,
  );
}

export async function getAiProviderForOrganization(
  organizationId: string,
  preferredModel?: string | null,
): Promise<IAiProvider> {
  const aiSetting = await prisma.aiSetting.findUnique({
    where: { organizationId },
  });

  if (aiSetting?.apiKey && aiSetting.provider) {
    const model =
      preferredModel ??
      aiSetting.draftingModel ??
      aiSetting.model ??
      undefined;
    return createAiProvider(
      aiSetting.provider as AiProvider,
      aiSetting.apiKey,
      model,
    );
  }

  if (!hasEnvAiCredentials()) {
    throw new AiNotConfiguredError();
  }

  return getProviderFromEnv();
}
