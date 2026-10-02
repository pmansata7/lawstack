"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EvidenceUploadZone } from "@/components/cases/evidence-upload-zone";
import { Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Evidence {
  id: string;
  title: string;
  type: string;
  fileName: string | null;
  fileUrl: string | null;
}

export function DocumentsTab({
  caseId,
  initialEvidence,
}: {
  caseId: string;
  initialEvidence: Evidence[];
}) {
  const router = useRouter();
  const [evidence, setEvidence] = useState(initialEvidence);

  useEffect(() => {
    setEvidence(initialEvidence);
  }, [initialEvidence]);

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
      <EvidenceUploadZone
        embedded
        caseId={caseId}
        onUploaded={() => router.refresh()}
      />

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
