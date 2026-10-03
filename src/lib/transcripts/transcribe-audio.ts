import "server-only";

import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import type { TranscriptSegment } from "@/lib/transcripts/format-segments";

export class TranscriptionNotConfiguredError extends Error {
  constructor() {
    super(
      "Audio transcription requires an OpenAI API key in Settings → AI (Whisper), or OPENAI_API_KEY on the server.",
    );
    this.name = "TranscriptionNotConfiguredError";
  }
}

async function resolveOpenAiKey(organizationId: string): Promise<string | null> {
  const settings = await prisma.aiSetting.findUnique({
    where: { organizationId },
  });
  if (settings?.provider === "openai" && settings.apiKey) {
    return settings.apiKey;
  }
  return process.env.OPENAI_API_KEY ?? null;
}

function whisperSegmentsToTranscript(
  verbose: OpenAI.Audio.Transcriptions.TranscriptionVerbose,
): { content: string; segments: TranscriptSegment[] } {
  const segments: TranscriptSegment[] = (verbose.segments ?? []).map((s) => ({
    speaker: null,
    text: s.text.trim(),
    startMs: Math.round((s.start ?? 0) * 1000),
    endMs: Math.round((s.end ?? 0) * 1000),
  }));

  const content =
    verbose.text?.trim() ||
    segments.map((s) => s.text).join(" ").trim();

  return { content, segments };
}

export async function transcribeAudioBuffer(
  organizationId: string,
  buffer: Buffer,
  fileName: string,
  mimeType?: string | null,
): Promise<{ content: string; segments: TranscriptSegment[] }> {
  const apiKey = await resolveOpenAiKey(organizationId);
  if (!apiKey) {
    throw new TranscriptionNotConfiguredError();
  }

  const client = new OpenAI({ apiKey });
  const blob = new Blob([new Uint8Array(buffer)], {
    type: mimeType || "audio/webm",
  });
  const file = new File([blob], fileName || "recording.webm", {
    type: mimeType || "audio/webm",
  });

  const result = await client.audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "verbose_json",
  });

  return whisperSegmentsToTranscript(result);
}
