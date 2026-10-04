import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { listGranolaNotes } from "@/lib/transcripts/granola-client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cursor = new URL(req.url).searchParams.get("cursor");
  const settings = await prisma.aiSetting.findUnique({
    where: { organizationId: session.orgId },
  });

  const apiKey =
    settings?.granolaApiKey ?? process.env.GRANOLA_API_KEY ?? null;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Add a Granola API key in Settings → AI (Connectors → API keys in Granola).",
        configured: false,
      },
      { status: 400 },
    );
  }

  try {
    const { notes, nextCursor } = await listGranolaNotes(apiKey, {
      limit: 40,
      cursor,
    });
    return NextResponse.json({
      configured: true,
      notes: notes.map((n) => ({
        id: n.id,
        title: n.title,
        created_at: n.created_at,
        summary_text: n.summary_text,
      })),
      nextCursor,
    });
  } catch (err) {
    console.error("Granola list error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to list Granola notes",
      },
      { status: 502 },
    );
  }
}
