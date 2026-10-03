import "server-only";

import type { CaseTranscript } from "@prisma/client";
import {
  formatSegmentsForPrompt,
  type TranscriptSegment,
} from "@/lib/transcripts/format-segments";

export function buildTranscriptsContextForIntake(
  transcripts: CaseTranscript[],
): string {
  if (transcripts.length === 0) return "";

  const sections = transcripts.map((t) => {
    const segments = t.segments as TranscriptSegment[] | null;
    return formatSegmentsForPrompt(t.title, t.content, segments, t.summary);
  });

  return `Case meeting / call transcripts (${transcripts.length}):\n\n${sections.join("\n\n---\n\n")}`;
}
