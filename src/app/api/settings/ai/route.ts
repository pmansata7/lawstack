import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const updated = await prisma.aiSetting.upsert({
    where: { organizationId: session.orgId },
    create: {
      organizationId: session.orgId,
      provider: body.provider ?? "openai",
      apiKey: body.apiKey,
      granolaApiKey: body.granolaApiKey,
      model: body.model ?? "gpt-4o",
      analysisModel: body.analysisModel || null,
      draftingModel: body.draftingModel || null,
      temperature: body.temperature ?? 0.7,
    },
    update: {
      provider: body.provider,
      apiKey: body.apiKey || undefined,
      granolaApiKey: body.granolaApiKey || undefined,
      model: body.model,
      analysisModel: body.analysisModel || null,
      draftingModel: body.draftingModel || null,
      temperature: body.temperature,
    },
  });

  return NextResponse.json({ settings: updated });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.aiSetting.findUnique({
    where: { organizationId: session.orgId },
  });

  return NextResponse.json({
    settings: settings
      ? {
          provider: settings.provider,
          model: settings.model,
          analysisModel: settings.analysisModel,
          draftingModel: settings.draftingModel,
          temperature: settings.temperature,
          hasApiKey: !!settings.apiKey,
          hasGranolaApiKey: !!settings.granolaApiKey,
        }
      : null,
  });
}
