import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getCaseForOrganization } from "@/lib/cases/get-case-for-org";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveEvidenceStoragePath } from "@/lib/evidence/resolve-storage-path";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  transcribeAudioBuffer,
  TranscriptionNotConfiguredError,
} from "@/lib/transcripts/transcribe-audio";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; transcriptId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: caseId, transcriptId } = await params;
  const caseData = await getCaseForOrganization(caseId, session.orgId);
  if (!caseData) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const transcript = await prisma.caseTranscript.findFirst({
    where: { id: transcriptId, caseId },
  });
  if (!transcript) {
    return NextResponse.json({ error: "Transcript not found" }, { status: 404 });
  }

  if (!transcript.audioEvidenceId) {
    return NextResponse.json(
      { error: "This transcript has no linked recording to transcribe." },
      { status: 400 },
    );
  }

  const evidence = await prisma.evidence.findUnique({
    where: { id: transcript.audioEvidenceId },
  });
  if (!evidence?.fileUrl) {
    return NextResponse.json(
      { error: "Recording file not found." },
      { status: 404 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Storage is not configured for audio download." },
      { status: 503 },
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const path = resolveEvidenceStoragePath(evidence.fileUrl);
    const { data, error } = await supabase.storage.from("evidence").download(path);
    if (error || !data) {
      throw new Error(error?.message ?? "Download failed");
    }
    const buffer = Buffer.from(await data.arrayBuffer());

    const transcribed = await transcribeAudioBuffer(
      session.orgId,
      buffer,
      evidence.fileName ?? "recording.webm",
      evidence.mimeType,
    );

    const updated = await prisma.caseTranscript.update({
      where: { id: transcriptId },
      data: {
        content: transcribed.content,
        segments: transcribed.segments,
        status: "READY",
      },
    });

    return NextResponse.json({ transcript: updated });
  } catch (err) {
    if (err instanceof TranscriptionNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("Transcribe error:", err);
    await prisma.caseTranscript.update({
      where: { id: transcriptId },
      data: { status: "FAILED" },
    });
    return NextResponse.json(
      { error: "Transcription failed. Check OpenAI key and try again." },
      { status: 500 },
    );
  }
}
