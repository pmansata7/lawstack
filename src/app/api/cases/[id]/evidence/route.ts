import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const titleRaw = formData.get("title");
  const type = formData.get("type") as string;
  const relativePathRaw = formData.get("relativePath");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "A valid file is required" }, { status: 400 });
  }

  const title =
    typeof titleRaw === "string" && titleRaw.trim().length > 0
      ? titleRaw.trim()
      : file.name;
  const relativePath =
    typeof relativePathRaw === "string" && relativePathRaw.trim().length > 0
      ? relativePathRaw.trim()
      : null;

  const caseData = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
  });
  if (!caseData) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Upload to Supabase Storage
  const supabase = await createSupabaseServerClient();
  const filePath = `${session.orgId}/${id}/${Date.now()}-${file.name}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("evidence")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    // Fallback: store metadata only if storage isn't configured
    console.error("Storage error:", uploadError);
  }

  const { data: urlData } = supabase.storage
    .from("evidence")
    .getPublicUrl(filePath);

  const evidence = await prisma.evidence.create({
    data: {
      caseId: id,
      type: (type ?? "DOCUMENT") as "DOCUMENT" | "TIMELINE" | "WITNESS" | "DAMAGES" | "PHOTO" | "VIDEO" | "AUDIO" | "OTHER",
      title,
      fileUrl: uploadData?.path ?? urlData?.publicUrl ?? null,
      fileName: relativePath ?? file.name,
      fileSize: file.size,
      mimeType: file.type,
      metadata: relativePath ? { relativePath } : undefined,
    },
  });

  return NextResponse.json({ evidence });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const evidenceId = new URL(req.url).searchParams.get("id");

  const caseData = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
  });
  if (!caseData) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const evidence = await prisma.evidence.findUnique({
    where: { id: evidenceId! },
  });

  if (evidence?.fileUrl) {
    const supabase = await createSupabaseServerClient();
    await supabase.storage.from("evidence").remove([evidence.fileUrl]);
  }

  await prisma.evidence.delete({ where: { id: evidenceId! } });
  return NextResponse.json({ success: true });
}
