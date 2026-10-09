"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

type DeleteCaseDialogProps = {
  caseId: string;
  caseTitle: string;
  redirectTo?: string;
  trigger?: React.ReactNode;
  variant?: "icon" | "button";
};

export function DeleteCaseDialog({
  caseId,
  caseTitle,
  redirectTo = "/dashboard",
  trigger,
  variant = "button",
}: DeleteCaseDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const canDelete = confirm === caseTitle;

  const handleDelete = async () => {
    if (!canDelete) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmTitle: confirm }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Delete failed",
        );
      }
      toast.success("Case deleted");
      setOpen(false);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger =
    variant === "icon" ? (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-ink-500 hover:bg-destructive/10 hover:text-destructive"
        aria-label="Delete case"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    ) : (
      <Button
        type="button"
        variant="outline"
        className="border-destructive/30 text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete case
      </Button>
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirm("");
      }}
    >
      <DialogTrigger>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this case?</DialogTitle>
          <DialogDescription>
            This permanently removes the matter, facts, evidence, analyses, and
            drafts. Storage files linked to this case are removed when possible.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <p className="text-sm text-ink-600">
            Type{" "}
            <span className="font-semibold text-navy-950">{caseTitle}</span> to
            confirm.
          </p>
          <Label htmlFor={`delete-confirm-${caseId}`} className="sr-only">
            Confirm case title
          </Label>
          <Input
            id={`delete-confirm-${caseId}`}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={caseTitle}
            autoComplete="off"
            disabled={loading}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!canDelete || loading}
            onClick={handleDelete}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
