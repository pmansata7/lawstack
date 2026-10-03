import type { TranscriptSegment } from "@/lib/transcripts/format-segments";
import { segmentsToPlainText } from "@/lib/transcripts/format-segments";

export type ParsedTranscriptImport = {
  title: string;
  content: string;
  segments?: TranscriptSegment[];
  summary?: string;
  recordedAt?: Date;
  externalId?: string;
  sourceHint: "granola" | "generic";
};

function pickString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function parseGranolaOfficialSegments(raw: unknown): TranscriptSegment[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const segments: TranscriptSegment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const text = pickString(obj.text);
    if (!text) continue;
    let speaker: string | undefined;
    const sp = obj.speaker;
    if (sp && typeof sp === "object" && !Array.isArray(sp)) {
      const speakerObj = sp as Record<string, unknown>;
      speaker =
        pickString(speakerObj.name) ??
        pickString(speakerObj.diarization_label) ??
        pickString(speakerObj.attribution) ??
        pickString(speakerObj.source);
    } else if (typeof sp === "string") {
      speaker = sp;
    }
    segments.push({ speaker: speaker ?? null, text });
  }
  return segments.length > 0 ? segments : undefined;
}

function parseRileyCxSegments(raw: unknown): TranscriptSegment[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const segments: TranscriptSegment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const text = pickString(obj.text);
    if (!text) continue;
    const speaker = pickString(obj.speaker);
    const start =
      typeof obj.start === "number"
        ? obj.start
        : typeof obj.startMs === "number"
          ? obj.startMs
          : null;
    const end =
      typeof obj.end === "number"
        ? obj.end
        : typeof obj.endMs === "number"
          ? obj.endMs
          : null;
    segments.push({
      speaker: speaker ?? null,
      text,
      startMs: start,
      endMs: end,
    });
  }
  return segments.length > 0 ? segments : undefined;
}

function parseJsonTranscript(data: unknown): ParsedTranscriptImport | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }
  const obj = data as Record<string, unknown>;

  const title =
    pickString(obj.title) ??
    pickString(obj.name) ??
    pickString((obj as { summary_text?: string }).summary_text)?.slice(0, 80) ??
    "Imported transcript";

  const summary =
    pickString(obj.summary) ??
    pickString(obj.summary_text) ??
    pickString(obj.summary_markdown) ??
    pickString(obj.notes_markdown);

  const recordedAtRaw =
    pickString(obj.date) ??
    pickString(obj.created_at) ??
    pickString(obj.recorded_at);
  const recordedAt = recordedAtRaw ? new Date(recordedAtRaw) : undefined;

  const externalId = pickString(obj.id) ?? pickString(obj.document_id);

  let segments =
    parseGranolaOfficialSegments(obj.transcript) ??
    parseRileyCxSegments(obj.transcript_segments);

  const content =
    pickString(obj.transcript_text) ??
    pickString(obj.content) ??
    pickString(obj.text) ??
    (segments ? segmentsToPlainText(segments) : "") ??
    "";

  if (!content && !segments) {
    return null;
  }

  return {
    title,
    content: content || (segments ? segmentsToPlainText(segments) : ""),
    segments,
    summary,
    recordedAt:
      recordedAt && !Number.isNaN(recordedAt.getTime()) ? recordedAt : undefined,
    externalId,
    sourceHint: externalId || obj.transcript ? "granola" : "generic",
  };
}

function parsePlainText(text: string, fileName?: string): ParsedTranscriptImport {
  const baseName = fileName?.replace(/\.[^.]+$/, "") ?? "Imported transcript";
  return {
    title: baseName,
    content: text.trim(),
    sourceHint: "generic",
  };
}

export function parseTranscriptImportFile(
  buffer: Buffer,
  fileName: string,
  mimeType?: string | null,
): ParsedTranscriptImport {
  const text = buffer.toString("utf-8").replace(/^\uFEFF/, "");
  const lower = fileName.toLowerCase();
  const isJson =
    lower.endsWith(".json") ||
    mimeType?.includes("json") ||
    text.trimStart().startsWith("{") ||
    text.trimStart().startsWith("[");

  if (isJson) {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (Array.isArray(parsed)) {
        const first = parsed[0];
        const fromFirst = parseJsonTranscript(first);
        if (fromFirst) return fromFirst;
      }
      const fromObj = parseJsonTranscript(parsed);
      if (fromObj) return fromObj;
    } catch {
      // fall through to plain text
    }
  }

  return parsePlainText(text, fileName);
}
