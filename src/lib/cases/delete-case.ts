import { prisma } from "@/lib/prisma";
import { resolveEvidenceStoragePath } from "@/lib/evidence/resolve-storage-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteCaseForOrganization(
  caseId: string,
  organizationId: string,
): Promise<boolean> {
  const caseData = await prisma.case.findFirst({
    where: { id: caseId, organizationId },
    include: { evidence: { select: { fileUrl: true } } },
  });

  if (!caseData) {
    return false;
  }

  const storagePaths = caseData.evidence
    .map((e) => e.fileUrl)
    .filter((url): url is string => Boolean(url?.trim()))
    .map((url) => resolveEvidenceStoragePath(url));

  if (storagePaths.length > 0) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.storage
        .from("evidence")
        .remove(storagePaths);
      if (error) {
        console.error("Case delete storage cleanup error:", error);
      }
    } catch (err) {
      console.error("Case delete storage cleanup failed:", err);
    }
  }

  await prisma.case.delete({ where: { id: caseId } });
  return true;
}
