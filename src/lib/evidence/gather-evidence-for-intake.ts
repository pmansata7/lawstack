import "server-only";

import type { Evidence } from "@prisma/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { extractTextFromBuffer } from "@/lib/evidence/extract-text-from-buffer";
import { resolveEvidenceStoragePath } from "@/lib/evidence/resolve-storage-path";
import type { IAiProvider } from "@/lib/ai/provider";

export type EvidenceIntakeBlock = {
  id: string;
  title: string;
  fileName: string;
  type: string;
  text: string;
};

const PER_FILE_CHAR_LIMIT = 10_000;
const TOTAL_CHAR_LIMIT = 90_000;
const CONDENSE_THRESHOLD = 85_000;

async function downloadEvidenceBuffer(
  fileUrl: string,
): Promise<Buffer | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const path = resolveEvidenceStoragePath(fileUrl);
    const { data, error } = await supabase.storage
      .from("evidence")
      .download(path);
    if (error || !data) {
      console.warn("Evidence download failed:", path, error?.message);
      return null;
    }
    return Buffer.from(await data.arrayBuffer());
  } catch (err) {
    console.warn("Evidence download error:", err);
    return null;
  }
}

function metadataRelativePath(evidence: Evidence): string | null {
  const meta = evidence.metadata;
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return null;
  }
  const relativePath = (meta as { relativePath?: unknown }).relativePath;
  return typeof relativePath === "string" && relativePath.length > 0
    ? relativePath
    : null;
}

export async function extractEvidenceIntakeBlocks(
  evidenceList: Evidence[],
): Promise<EvidenceIntakeBlock[]> {
  const blocks: EvidenceIntakeBlock[] = [];

  for (const item of evidenceList) {
    const displayPath =
      metadataRelativePath(item) ?? item.fileName ?? item.title;
    let text = "";

    if (item.fileUrl) {
      const buffer = await downloadEvidenceBuffer(item.fileUrl);
      if (buffer) {
        text = await extractTextFromBuffer(
          buffer,
          item.mimeType,
          displayPath,
          PER_FILE_CHAR_LIMIT,
        );
      }
    }

    blocks.push({
      id: item.id,
      title: item.title,
      fileName: displayPath,
      type: item.type,
      text,
    });
  }

  return blocks;
}

function formatEvidenceBlocks(blocks: EvidenceIntakeBlock[]): string {
  const manifest = blocks
    .map(
      (b, i) =>
        `${i + 1}. [${b.type}] ${b.title}${b.fileName !== b.title ? ` — ${b.fileName}` : ""}`,
    )
    .join("\n");

  const sections = blocks
    .map((b) => {
      const body =
        b.text.length > 0
          ? b.text
          : "(No extractable text — use filename/path and type as context.)";
      return `### Document: ${b.title}\nFile: ${b.fileName}\nType: ${b.type}\n\n${body}`;
    })
    .join("\n\n---\n\n");

  return `Uploaded case documents (${blocks.length} files):\n${manifest}\n\n---\n\n${sections}`;
}

function trimBlocksToCharBudget(
  blocks: EvidenceIntakeBlock[],
  maxChars: number,
): string {
  let used = 0;
  const parts: string[] = [];
  const manifest = blocks
    .map(
      (b, i) =>
        `${i + 1}. [${b.type}] ${b.title}${b.fileName !== b.title ? ` — ${b.fileName}` : ""}`,
    )
    .join("\n");
  parts.push(
    `Uploaded case documents (${blocks.length} files):\n${manifest}\n\n---\n\n`,
  );
  used = parts[0].length;

  for (const b of blocks) {
    const header = `### Document: ${b.title}\nFile: ${b.fileName}\nType: ${b.type}\n\n`;
    const body =
      b.text.length > 0
        ? b.text
        : "(No extractable text — use filename/path and type as context.)";
    const remaining = maxChars - used - header.length - 8;
    if (remaining <= 200) {
      parts.push(
        `\n… [${blocks.length - parts.length + 1} additional documents omitted from full text; use the manifest above.]`,
      );
      break;
    }
    const slice =
      body.length > remaining
        ? `${body.slice(0, remaining)}\n… [truncated]`
        : body;
    parts.push(`${header}${slice}\n\n---\n\n`);
    used += header.length + slice.length + 8;
  }

  return parts.join("");
}

async function condenseWithAi(
  provider: IAiProvider,
  blocks: EvidenceIntakeBlock[],
  rawContext: string,
): Promise<string> {
  const result = await provider.generateCompletion(
    [
      {
        role: "system",
        content:
          "You are a litigation paralegal reviewing case files. Produce a dense factual digest from the provided document excerpts. Preserve exact dates, party names, dollar amounts, locations, and which document each fact came from. Use bullet points grouped by theme (timeline, parties, damages, communications, repairs, etc.). Do not invent facts not supported by the text.",
      },
      {
        role: "user",
        content: `Digest these ${blocks.length} case documents for later fact extraction:\n\n${rawContext.slice(0, 200_000)}`,
      },
    ],
    { temperature: 0.2, maxTokens: 8192 },
  );

  return `AI digest of ${blocks.length} uploaded documents:\n${result.content.trim()}`;
}

export async function buildEvidenceContextForFactsIntake(
  evidenceList: Evidence[],
  provider?: IAiProvider,
): Promise<{ context: string; documentCount: number; withTextCount: number }> {
  if (evidenceList.length === 0) {
    return { context: "", documentCount: 0, withTextCount: 0 };
  }

  const blocks = await extractEvidenceIntakeBlocks(evidenceList);
  const withTextCount = blocks.filter((b) => b.text.length > 0).length;
  const formatted = formatEvidenceBlocks(blocks);

  if (formatted.length <= CONDENSE_THRESHOLD) {
    return {
      context: formatted,
      documentCount: blocks.length,
      withTextCount,
    };
  }

  const trimmed = trimBlocksToCharBudget(blocks, TOTAL_CHAR_LIMIT);
  if (trimmed.length <= CONDENSE_THRESHOLD || !provider) {
    return {
      context: trimmed,
      documentCount: blocks.length,
      withTextCount,
    };
  }

  const digest = await condenseWithAi(provider, blocks, trimmed);
  return {
    context: digest,
    documentCount: blocks.length,
    withTextCount,
  };
}
