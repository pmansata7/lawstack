"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Trash2, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Evidence {
  id: string;
  title: string;
  type: string;
  fileName: string | null;
  fileUrl: string | null;
}

const EVIDENCE_TYPES = [
  { value: "DOCUMENT", label: "Document" },
  { value: "PHOTO", label: "Photo" },
  { value: "VIDEO", label: "Video" },
  { value: "AUDIO", label: "Audio" },
  { value: "OTHER", label: "Other" },
];

export function DocumentsTab({
  caseId,
  initialEvidence,
}: {
  caseId: string;
  initialEvidence: Evidence[];
}) {
  const router = useRouter();
  const [evidence, setEvidence] = useState(initialEvidence);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("DOCUMENT");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("type", type);

      const res = await fetch(`/api/cases/${caseId}/evidence`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Upload failed");
      }

      const { evidence: newEvidence } = await res.json();
      setEvidence([newEvidence, ...evidence]);
      setTitle("");
      setType("DOCUMENT");
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Document uploaded");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (evidenceId: string) => {
    try {
      const res = await fetch(
        `/api/cases/${caseId}/evidence?id=${evidenceId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to delete");
      setEvidence(evidence.filter((e) => e.id !== evidenceId));
      toast.success("Document deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="doc-title">Document Title</Label>
                <Input
                  id="doc-title"
                  placeholder="Medical Records"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-type">Type</Label>
                <Select value={type} onValueChange={(v: string | null) => setType(v ?? "DOCUMENT")}>
                  <SelectTrigger id="doc-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVIDENCE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-file">File</Label>
              <Input
                id="doc-file"
                type="file"
                ref={fileRef}
                className="cursor-pointer"
              />
            </div>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload Document
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {evidence.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No documents uploaded yet.
          </p>
        )}
        {evidence.map((e) => (
          <Card key={e.id}>
            <CardContent className="flex items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{e.title}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{e.type}</Badge>
                    {e.fileName && <span>{e.fileName}</span>}
                  </div>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(e.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
