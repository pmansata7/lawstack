import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session-from-request";
import {
  buildCaseIntakeSystemPrompt,
  buildCaseIntakeUserPrompt,
} from "@/lib/ai/intake-prompts";
import { normalizeCaseIntake } from "@/lib/ai/intake-schemas";
import { parseCompletionJson } from "@/lib/ai/parse-completion-json";
import {
  AiNotConfiguredError,
  getAiProviderForOrganization,
} from "@/lib/ai/org-provider";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const narrative =
      typeof body.narrative === "string" ? body.narrative.trim() : "";
    if (narrative.length < 20) {
      return NextResponse.json(
        {
          error:
            "Please describe the dispute in at least a few sentences (20+ characters).",
        },
        { status: 400 },
      );
    }

    const provider = await getAiProviderForOrganization(session.orgId);
    const result = await provider.generateCompletion(
      [
        { role: "system", content: buildCaseIntakeSystemPrompt() },
        { role: "user", content: buildCaseIntakeUserPrompt(narrative) },
      ],
      { temperature: 0.2, maxTokens: 2048 },
    );

    const parsed = parseCompletionJson<unknown>(result.content);
    const suggestion = normalizeCaseIntake(parsed);

    return NextResponse.json({ suggestion });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Case intake AI error:", error);
    return NextResponse.json(
      { error: "Failed to generate case suggestions. Try again or fill fields manually." },
      { status: 500 },
    );
  }
}
