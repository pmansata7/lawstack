import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session-from-request";
import { prisma } from "@/lib/prisma";
import {
  AiNotConfiguredError,
  getAiProviderForOrganization,
} from "@/lib/ai/org-provider";
import type { ChatMessage } from "@/lib/ai/provider";
import {
  buildCaseChatSystemPrompt,
  buildCaseContext,
} from "@/lib/ai/prompts";
import { CLAIM_TEMPLATES } from "@/lib/legal/claim-templates";

type ClientMessage = { role: "user" | "assistant"; content: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];

    const messages: ClientMessage[] = rawMessages
      .filter(
        (m: unknown): m is ClientMessage =>
          typeof m === "object" &&
          m != null &&
          (m as ClientMessage).role !== undefined &&
          ((m as ClientMessage).role === "user" ||
            (m as ClientMessage).role === "assistant") &&
          typeof (m as ClientMessage).content === "string",
      )
      .slice(-20);

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser?.content.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const caseData = await prisma.case.findFirst({
      where: { id, organizationId: session.orgId },
      include: {
        claims: true,
        facts: true,
        evidence: true,
        timeline: { orderBy: { date: "asc" } },
        witnesses: true,
        damages: true,
      },
    });

    if (!caseData) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const ctx = buildCaseContext(
      {
        title: caseData.title,
        courtType: caseData.courtType,
        jurisdiction: caseData.jurisdiction,
        plaintiff: caseData.plaintiff,
        defendant: caseData.defendant,
      },
      caseData.claims,
      CLAIM_TEMPLATES,
      caseData.facts,
      caseData.timeline,
      caseData.witnesses,
      caseData.damages,
      caseData.evidence,
    );

    const provider = await getAiProviderForOrganization(session.orgId);

    const chatMessages: ChatMessage[] = [
      { role: "system", content: buildCaseChatSystemPrompt(ctx) },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content.trim(),
      })),
    ];

    const result = await provider.generateCompletion(chatMessages, {
      temperature: 0.4,
      maxTokens: 2048,
    });

    return NextResponse.json({ reply: result.content.trim() });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Case chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate a response" },
      { status: 500 },
    );
  }
}
