import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getCaseForOrganization } from "@/lib/cases/get-case-for-org";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseTranscriptImportFile } from "@/lib/transcripts/parse-import";
import { granolaNoteToParsedImport } from "@/lib/transcripts/granola-import";
import {
  transcribeAudioBuffer,
  TranscriptionNotConfiguredError,
} from "@/lib/transcripts/transcribe-audio";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: caseId } = await params;
  const caseData = await getCaseForOrganization(caseId, session.orgId);
  if (!caseData) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const mode = String(formData.get("mode") ?? "import");

    if (mode === "recording") {
      const audio = formData.get("audio");
      const titleRaw = formData.get("title");
      const autoTranscribe = formData.get("autoTranscribe") !== "false";

      if (!audio || typeof audio === "string") {
        return NextResponse.json({ error: "Audio file required" }, { status: 400 });
      }

      const title =
        typeof titleRaw === "string" && titleRaw.trim().length > 0
          ? titleRaw.trim()
          : `Recording ${new Date().toLocaleString()}`;

      const supabase = await createSupabaseServerClient();
      const filePath = `${session.orgId}/${caseId}/recordings/${Date.now()}-${audio.name || "recording.webm"}`;

      const buffer = Buffer.from(await audio.arrayBuffer());

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("evidence")
        .upload(filePath, buffer, {
          contentType: audio.type || "audio/webm",
          upsert: false,
        });

      if (uploadError) {
        console.error("Recording upload error:", uploadError);
      }

      const evidence = await prisma.evidence.create({
        data: {
          caseId,
          type: "AUDIO",
          title,
          fileUrl: uploadData?.path ?? filePath,
          fileName: audio.name || "recording.webm",
          fileSize: buffer.length,
          mimeType: audio.type || "audio/webm",
        },
      });

      let content = "";
      let segments: Prisma.InputJsonValue | undefined = undefined;
      let status: "PENDING_TRANSCRIPTION" | "READY" | "FAILED" =
        "PENDING_TRANSCRIPTION";

      if (autoTranscribe) {
        try {
          const transcribed = await transcribeAudioBuffer(
            session.orgId,
            buffer,
            audio.name || "recording.webm",
            audio.type,
          );
          content = transcribed.content;
          segments = transcribed.segments as Prisma.InputJsonValue;
          status = "READY";
        } catch (err) {
          if (err instanceof TranscriptionNotConfiguredError) {
            status = "PENDING_TRANSCRIPTION";
          } else {
            console.error("Recording transcription failed:", err);
            status = "FAILED";
          }
        }
      }

      const transcript = await prisma.caseTranscript.create({
        data: {
          caseId,
          title,
          source: "RECORDING",
          content,
          segments,
          recordedAt: new Date(),
          audioEvidenceId: evidence.id,
          status,
        },
      });

      return NextResponse.json({ transcript, evidenceId: evidence.id });
    }

    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = parseTranscriptImportFile(
      buffer,
      file.name,
      file.type,
    );

    const transcript = await prisma.caseTranscript.create({
      data: {
        caseId,
        title: parsed.title,
        source: parsed.sourceHint === "granola" ? "GRANOLA" : "IMPORT",
        externalId: parsed.externalId ?? null,
        content: parsed.content,
        segments: parsed.segments ?? undefined,
        summary: parsed.summary ?? null,
        recordedAt: parsed.recordedAt ?? null,
        status: "READY",
        metadata: { fileName: file.name },
      },
    });

    return NextResponse.json({ transcript });
  }

  const body = await req.json().catch(() => ({}));
  const granolaNoteId =
    typeof body.granolaNoteId === "string" ? body.granolaNoteId.trim() : "";

  if (granolaNoteId) {
    const settings = await prisma.aiSetting.findUnique({
      where: { organizationId: session.orgId },
    });
    const granolaKey =
      settings?.granolaApiKey ?? process.env.GRANOLA_API_KEY ?? null;
    if (!granolaKey) {
      return NextResponse.json(
        {
          error:
            "Add a Granola API key in Settings → AI to import notes from Granola.",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.caseTranscript.findFirst({
      where: { caseId, externalId: granolaNoteId, source: "GRANOLA" },
    });
    if (existing) {
      return NextResponse.json({ transcript: existing, duplicate: true });
    }

    try {
      const parsed = await granolaNoteToParsedImport(granolaKey, granolaNoteId);
      const transcript = await prisma.caseTranscript.create({
        data: {
          caseId,
          title: parsed.title,
          source: "GRANOLA",
          externalId: granolaNoteId,
          content: parsed.content,
          segments: parsed.segments ?? undefined,
          summary: parsed.summary ?? null,
          recordedAt: parsed.recordedAt ?? null,
          status: "READY",
        },
      });
      return NextResponse.json({ transcript });
    } catch (err) {
      console.error("Granola import error:", err);
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Failed to import Granola note",
        },
        { status: 502 },
      );
    }
  }

  const manualTitle =
    typeof body.title === "string" ? body.title.trim() : "";
  const manualContent =
    typeof body.content === "string" ? body.content.trim() : "";
  if (manualTitle && manualContent.length >= 20) {
    const transcript = await prisma.caseTranscript.create({
      data: {
        caseId,
        title: manualTitle,
        source: "MANUAL",
        content: manualContent,
        status: "READY",
      },
    });
    return NextResponse.json({ transcript });
  }

  return NextResponse.json(
    { error: "Provide a file, granolaNoteId, or title + content" },
    { status: 400 },
  );
}
