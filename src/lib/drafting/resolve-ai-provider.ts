import { prisma } from "@/lib/prisma";
import {
  createAiProvider,
  getProviderFromEnv,
  type AiProvider,
} from "@/lib/ai/provider";

export async function resolveOrgAiProvider(
  organizationId: string,
  preferredModel?: string | null,
) {
  const aiSetting = await prisma.aiSetting.findUnique({
    where: { organizationId },
  });

  if (aiSetting?.apiKey && aiSetting.provider) {
    return createAiProvider(
      aiSetting.provider as AiProvider,
      aiSetting.apiKey,
      preferredModel ?? aiSetting.draftingModel ?? aiSetting.model,
    );
  }

  return getProviderFromEnv();
}

export function parseAiJson(content: string): unknown {
  let jsonStr = content.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return JSON.parse(jsonStr);
}
