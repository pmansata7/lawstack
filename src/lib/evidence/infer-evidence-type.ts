import type { EvidenceType } from "@prisma/client";

export function inferEvidenceType(file: File): EvidenceType {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (mime.startsWith("image/")) return "PHOTO";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime.startsWith("audio/")) return "AUDIO";

  if (/\.(jpg|jpeg|png|gif|webp|heic|bmp|tiff?)$/.test(name)) return "PHOTO";
  if (/\.(mp4|mov|avi|webm|mkv)$/.test(name)) return "VIDEO";
  if (/\.(mp3|wav|m4a|aac|ogg|flac)$/.test(name)) return "AUDIO";

  return "DOCUMENT";
}

export function evidenceTitleFromFile(file: File): string {
  const relativePath =
    "webkitRelativePath" in file &&
    typeof file.webkitRelativePath === "string" &&
    file.webkitRelativePath.length > 0
      ? file.webkitRelativePath
      : file.name;

  const base = relativePath.split("/").pop() ?? file.name;
  const withoutExt = base.replace(/\.[^/.]+$/, "");
  return withoutExt.trim() || base || file.name;
}
