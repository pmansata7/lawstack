"use client";

import { useCallback, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { collectFilesFromDataTransfer } from "@/lib/evidence/collect-drop-files";
import { uploadCaseEvidence } from "@/lib/evidence/upload-case-evidence";
import { FolderUp, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

type EvidenceUploadZoneProps = {
  caseId: string;
  onUploaded?: () => void;
  /** When true, omits outer card chrome (for embedding in Documents tab). */
  embedded?: boolean;
  className?: string;
};

export function EvidenceUploadZone({
  caseId,
  onUploaded,
  embedded = false,
  className,
}: EvidenceUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const toUpload = files.filter((f) => f.size > 0 || f.name);
      if (toUpload.length === 0) {
        toast.error("No files to upload");
        return;
      }

      setUploading(true);
      setProgress({ done: 0, total: toUpload.length });

      let succeeded = 0;
      const failures: string[] = [];

      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        try {
          await uploadCaseEvidence(caseId, file);
          succeeded++;
        } catch (err) {
          const label =
            ("webkitRelativePath" in file &&
              file.webkitRelativePath &&
              String(file.webkitRelativePath)) ||
            file.name;
          failures.push(
            `${label}: ${err instanceof Error ? err.message : "Upload failed"}`,
          );
        }
        setProgress({ done: i + 1, total: toUpload.length });
      }

      setUploading(false);
      setProgress(null);

      if (succeeded > 0) {
        toast.success(
          succeeded === 1
            ? "Document uploaded"
            : `${succeeded} documents uploaded`,
        );
        onUploaded?.();
      }
      if (failures.length > 0) {
        toast.error(
          failures.length === 1
            ? failures[0]
            : `${failures.length} files failed to upload`,
          {
            description:
              failures.length > 1
                ? failures.slice(0, 3).join("\n") +
                  (failures.length > 3 ? `\n…and ${failures.length - 3} more` : "")
                : undefined,
          },
        );
      }
    },
    [caseId, onUploaded],
  );

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (uploading) return;
    const files = await collectFilesFromDataTransfer(e.dataTransfer);
    await uploadFiles(files);
  };

  const zone = (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed p-6 transition-colors",
        dragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 bg-muted/30",
        uploading && "pointer-events-none opacity-70",
        className,
      )}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragActive(false);
      }}
      onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => {
          const list = e.target.files;
          if (list?.length) void uploadFiles(Array.from(list));
          e.target.value = "";
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        className="sr-only"
        {...({
          webkitdirectory: "",
          directory: "",
          multiple: true,
        } as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={(e) => {
          const list = e.target.files;
          if (list?.length) void uploadFiles(Array.from(list));
          e.target.value = "";
        }}
      />

      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Upload className="h-6 w-6 text-primary" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">
            Drop files or folders here, or choose from your computer
          </p>
          <p className="text-xs text-muted-foreground">
            PDFs, images, audio, video, and other supporting files. Folder
            structure is preserved in document titles.
          </p>
          {progress && (
            <div className="space-y-1 pt-2">
              <Progress value={(progress.done / progress.total) * 100} />
              <p className="text-xs text-muted-foreground">
                Uploading {progress.done} of {progress.total}…
              </p>
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose files
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => folderInputRef.current?.click()}
          >
            <FolderUp className="mr-2 h-4 w-4" />
            Choose folder
          </Button>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return zone;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Upload documents</CardTitle>
        <CardDescription>
          Add case files in bulk. Uploaded documents appear under the Documents
          tab and can support your facts and AI analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>{zone}</CardContent>
    </Card>
  );
}
