import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; draftId: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, draftId } = await params;
  const format = new URL(req.url).searchParams.get("format") ?? "txt";

  const caseData = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
  });
  if (!caseData) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
  });
  if (!draft || draft.caseId !== id) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const sections = draft.sections as Array<{
    heading: string;
    body: string;
    citations: string[];
  }>;

  // Build formatted text content
  let content = "";
  if (format === "txt" || format === "pdf") {
    content = sections
      .map((s) => `${s.heading.toUpperCase()}\n${"=".repeat(s.heading.length)}\n\n${s.body}`)
      .join("\n\n");
  } else if (format === "docx") {
    // Simple DOCX-like format (HTML body that can be opened in Word)
    content = sections
      .map((s) => `<h2>${s.heading}</h2><p style="white-space: pre-wrap;">${s.body.replace(/\n/g, "<br>")}</p>`)
      .join("");
    content = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${content}</body></html>`;
  }

  let mimeType = "text/plain";
  let fileExt = "txt";

  if (format === "pdf") {
    // For PDF, return as text — in production, use a PDF library
    // For now, return plain text with PDF mime type for download
    mimeType = "application/pdf";
    fileExt = "pdf";
    // Simple text-based PDF wrapper
    content = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n0\n%%EOF\n\n${content}`;
  } else if (format === "docx") {
    mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    fileExt = "docx";
    // For a real DOCX, use the docx npm package; this returns HTML that Word can open
    mimeType = "text/html";
    fileExt = "doc";
  }

  const fileName = `${draft.title.replace(/\s+/g, "_")}.${fileExt}`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
