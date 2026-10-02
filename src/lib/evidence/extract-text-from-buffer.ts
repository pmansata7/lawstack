import "server-only";

const TEXT_EXTENSIONS =
  /\.(txt|md|csv|json|xml|html?|log|rtf|eml|msg)$/i;

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string | null | undefined,
  fileName: string,
  maxChars = 12_000,
): Promise<string> {
  const mime = (mimeType ?? "").toLowerCase();
  const name = fileName.toLowerCase();

  let text = "";

  if (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/xml" ||
    TEXT_EXTENSIONS.test(name)
  ) {
    text = buffer.toString("utf-8");
  } else if (mime === "application/pdf" || name.endsWith(".pdf")) {
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const parsed = await parser.getText();
      await parser.destroy();
      text = typeof parsed.text === "string" ? parsed.text : "";
    } catch (err) {
      console.warn(`PDF text extraction failed for ${fileName}:`, err);
      text = "";
    }
  }

  const normalized = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (normalized.length <= maxChars) {
    return normalized;
  }
  return `${normalized.slice(0, maxChars)}\n… [truncated]`;
}
