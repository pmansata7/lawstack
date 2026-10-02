/** Normalize evidence.fileUrl to a Supabase storage object path. */
export function resolveEvidenceStoragePath(fileUrl: string): string {
  const trimmed = fileUrl.trim();
  if (!trimmed.startsWith("http")) {
    return trimmed.replace(/^\/+/, "");
  }

  const publicMatch = trimmed.match(
    /\/storage\/v1\/object\/public\/evidence\/(.+)$/i,
  );
  if (publicMatch?.[1]) {
    return decodeURIComponent(publicMatch[1]);
  }

  const signedMatch = trimmed.match(
    /\/storage\/v1\/object\/sign\/evidence\/([^?]+)/i,
  );
  if (signedMatch?.[1]) {
    return decodeURIComponent(signedMatch[1]);
  }

  return trimmed;
}
