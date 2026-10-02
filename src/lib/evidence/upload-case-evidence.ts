import {
  evidenceTitleFromFile,
  inferEvidenceType,
} from "@/lib/evidence/infer-evidence-type";

export type UploadedEvidence = {
  id: string;
  title: string;
  type: string;
  fileName: string | null;
  fileUrl: string | null;
};

export async function uploadCaseEvidence(
  caseId: string,
  file: File,
  options?: { title?: string; type?: string },
): Promise<UploadedEvidence> {
  const relativePath =
    "webkitRelativePath" in file &&
    typeof file.webkitRelativePath === "string" &&
    file.webkitRelativePath.length > 0
      ? file.webkitRelativePath
      : undefined;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", options?.title ?? evidenceTitleFromFile(file));
  formData.append("type", options?.type ?? inferEvidenceType(file));
  if (relativePath) {
    formData.append("relativePath", relativePath);
  }

  const res = await fetch(`/api/cases/${caseId}/evidence`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err.error === "string" ? err.error : "Upload failed",
    );
  }

  const { evidence } = (await res.json()) as { evidence: UploadedEvidence };
  return evidence;
}
