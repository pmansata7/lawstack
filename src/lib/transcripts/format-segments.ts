export type TranscriptSegment = {
  speaker?: string | null;
  text: string;
  startMs?: number | null;
  endMs?: number | null;
};

export function segmentsToPlainText(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => {
      const speaker = s.speaker?.trim();
      const line = s.text.trim();
      if (!line) return "";
      return speaker ? `${speaker}: ${line}` : line;
    })
    .filter(Boolean)
    .join("\n");
}

export function formatSegmentsForPrompt(
  title: string,
  content: string,
  segments?: TranscriptSegment[] | null,
  summary?: string | null,
): string {
  const parts: string[] = [`### Transcript: ${title}`];
  if (summary?.trim()) {
    parts.push(`Summary:\n${summary.trim()}`);
  }
  if (segments && segments.length > 0) {
    parts.push(`Conversation:\n${segmentsToPlainText(segments)}`);
  } else if (content.trim()) {
    parts.push(content.trim());
  } else {
    parts.push("(No transcript text yet.)");
  }
  return parts.join("\n\n");
}
