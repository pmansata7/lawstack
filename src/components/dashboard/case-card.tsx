"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteCaseDialog } from "@/components/cases/delete-case-dialog";
import { FileText, FolderOpen, Brain, PenLine } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  SETUP: "Setting Up",
  FACTS: "Organizing Facts",
  ANALYSIS: "Legal Analysis",
  DRAFTING: "Drafting",
  REVIEW: "In Review",
  FILED: "Filed",
};

const STATUS_COLORS: Record<string, string> = {
  SETUP: "bg-tint text-navy-950",
  FACTS: "bg-tint text-navy-950",
  ANALYSIS: "bg-tint text-navy-950",
  DRAFTING: "bg-tint text-navy-950",
  REVIEW: "bg-tint text-navy-950",
  FILED: "bg-tint text-navy-950",
};

export type DashboardCaseCardProps = {
  id: string;
  title: string;
  status: string;
  courtType: string;
  jurisdiction: string;
  counts: {
    facts: number;
    evidence: number;
    analyses: number;
    drafts: number;
  };
};

export function DashboardCaseCard({
  id,
  title,
  status,
  courtType,
  jurisdiction,
  counts,
}: DashboardCaseCardProps) {
  const courtLabel =
    courtType === "FEDERAL"
      ? "Federal"
      : courtType === "SMALL_CLAIMS"
        ? "Small Claims"
        : "State";

  return (
    <Card className="border-hard transition-colors hover:bg-tint/40">
      <CardHeader>
        <div className="flex items-start gap-2">
          <Link href={`/cases/${id}/setup`} className="min-w-0 flex-1">
            <CardTitle className="text-lg leading-snug hover:underline">
              {title}
            </CardTitle>
          </Link>
          <div onClick={(e) => e.preventDefault()}>
            <DeleteCaseDialog
              caseId={id}
              caseTitle={title}
              variant="icon"
            />
          </div>
          <Badge variant="secondary" className={STATUS_COLORS[status]}>
            {STATUS_LABELS[status] ?? status}
          </Badge>
        </div>
        <CardDescription>
          <Link href={`/cases/${id}/setup`} className="hover:underline">
            {courtLabel} Court — {jurisdiction}
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={`/cases/${id}/setup`}
          className="flex flex-wrap gap-4 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {counts.facts} facts
          </span>
          <span className="flex items-center gap-1">
            <FolderOpen className="h-3.5 w-3.5" />
            {counts.evidence} evidence
          </span>
          <span className="flex items-center gap-1">
            <Brain className="h-3.5 w-3.5" />
            {counts.analyses} analyses
          </span>
          <span className="flex items-center gap-1">
            <PenLine className="h-3.5 w-3.5" />
            {counts.drafts} drafts
          </span>
        </Link>
      </CardContent>
    </Card>
  );
}
