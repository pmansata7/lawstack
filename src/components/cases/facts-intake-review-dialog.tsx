"use client";

import type { ReactNode } from "react";
import type { FactsIntakeSuggestion } from "@/lib/ai/intake-schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText } from "lucide-react";

type FactsIntakeReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestion: FactsIntakeSuggestion | null;
  documents?: { total: number; withExtractedText: number };
  applying: boolean;
  onConfirm: () => void;
};

export function FactsIntakeReviewDialog({
  open,
  onOpenChange,
  suggestion,
  documents,
  applying,
  onConfirm,
}: FactsIntakeReviewDialogProps) {
  if (!suggestion) return null;

  const totalItems =
    suggestion.facts.length +
    suggestion.timeline.length +
    suggestion.witnesses.length +
    suggestion.damages.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-4 py-4 pr-12">
          <DialogTitle>Review AI-generated case details</DialogTitle>
          <DialogDescription>
            Generated from{" "}
            {documents && documents.total > 0 ? (
              <>
                <span className="font-medium text-foreground">
                  {documents.total} uploaded document
                  {documents.total === 1 ? "" : "s"}
                </span>
                {documents.withExtractedText < documents.total
                  ? ` (${documents.withExtractedText} with extracted text)`
                  : ""}{" "}
                plus your instructions.{" "}
              </>
            ) : (
              "your description. "
            )}
            Confirm to add {totalItems} item{totalItems === 1 ? "" : "s"} to the
            case (you can edit anything afterward).
          </DialogDescription>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary">Facts: {suggestion.facts.length}</Badge>
            <Badge variant="secondary">
              Timeline: {suggestion.timeline.length}
            </Badge>
            <Badge variant="secondary">
              Witnesses: {suggestion.witnesses.length}
            </Badge>
            <Badge variant="secondary">
              Damages: {suggestion.damages.length}
            </Badge>
          </div>
        </DialogHeader>

        <div className="max-h-[50vh] flex-1 overflow-y-auto px-4 py-3">
          <div className="space-y-6 pr-2">
            {suggestion.notes && (
              <p className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                {suggestion.notes}
              </p>
            )}

            {suggestion.facts.length > 0 && (
              <Section title="Facts">
                <ul className="space-y-2">
                  {suggestion.facts.map((f, i) => (
                    <li
                      key={i}
                      className="rounded-md border bg-background p-2 text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{f.category}</Badge>
                        {f.date && <span>{f.date}</span>}
                      </div>
                      <p className="mt-1">{f.statement}</p>
                      {f.source && (
                        <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                          <FileText className="mt-0.5 h-3 w-3 shrink-0" />
                          {f.source}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {suggestion.timeline.length > 0 && (
              <Section title="Timeline">
                <ul className="space-y-2">
                  {suggestion.timeline.map((t, i) => (
                    <li
                      key={i}
                      className="rounded-md border bg-background p-2 text-sm"
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        {t.date}
                      </p>
                      <p className="font-medium">{t.title}</p>
                      {t.description && (
                        <p className="mt-1 text-muted-foreground">
                          {t.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {suggestion.witnesses.length > 0 && (
              <Section title="Witnesses">
                <ul className="space-y-2">
                  {suggestion.witnesses.map((w, i) => (
                    <li
                      key={i}
                      className="rounded-md border bg-background p-2 text-sm"
                    >
                      <p className="font-medium">{w.name}</p>
                      {w.statement && (
                        <p className="mt-1 text-muted-foreground">
                          {w.statement}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {suggestion.damages.length > 0 && (
              <Section title="Damages">
                <ul className="space-y-2">
                  {suggestion.damages.map((d, i) => (
                    <li
                      key={i}
                      className="rounded-md border bg-background p-2 text-sm"
                    >
                      <p>
                        <span className="font-medium">
                          ${d.amount.toLocaleString()}
                        </span>{" "}
                        <Badge variant="outline" className="ml-1">
                          {d.category}
                        </Badge>
                      </p>
                      {d.description && (
                        <p className="mt-1 text-muted-foreground">
                          {d.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {totalItems === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No items were generated. Try a sample prompt or upload more
                documents, then generate again.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="border-t px-4 py-3">
          <Button
            type="button"
            variant="outline"
            disabled={applying}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={applying || totalItems === 0}
            onClick={onConfirm}
          >
            {applying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Add to case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}
