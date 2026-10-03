import "server-only";

import { parseTranscriptImportFile } from "@/lib/transcripts/parse-import";
import {
  getGranolaNote,
  getGranolaTranscriptPages,
  type GranolaNoteDetail,
} from "@/lib/transcripts/granola-client";

export async function granolaNoteToParsedImport(
  apiKey: string,
  noteId: string,
): Promise<ReturnType<typeof parseTranscriptImportFile>> {
  let note: GranolaNoteDetail;
  try {
    note = await getGranolaNote(apiKey, noteId);
  } catch (err) {
    throw err;
  }

  let transcript = note.transcript;
  if (
    transcript === "TRANSCRIPT_TOO_LARGE" ||
    transcript === null ||
    transcript === undefined
  ) {
    transcript = await getGranolaTranscriptPages(apiKey, noteId);
  }

  const payload = {
    id: note.id,
    title: note.title,
    created_at: note.created_at,
    summary_text: note.summary_text,
    summary_markdown: note.summary_markdown,
    transcript,
  };

  return parseTranscriptImportFile(
    Buffer.from(JSON.stringify(payload), "utf-8"),
    `${note.title || noteId}.json`,
    "application/json",
  );
}
