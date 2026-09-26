"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileText,
  MessageSquare,
  CheckCircle2,
  Circle,
  Send,
  Loader2,
  FileCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReviewViewProps {
  caseId: string;
  draft: {
    id: string;
    title: string;
    content: string;
    sections: unknown;
    citations: unknown;
    version: number;
    status: string;
    comments: Array<{
      id: string;
      userId: string;
      email: string;
      section: string | null;
      content: string;
      resolved: boolean;
      createdAt: Date;
    }>;
  } | null;
  analysis: {
    id: string;
    claimStrength: string;
    dismissalRisk: string;
    strengths: unknown;
    vulnerabilities: unknown;
  } | null;
  userEmail: string;
  userId: string;
}

export function ReviewView({
  caseId,
  draft,
  analysis,
  userEmail,
  userId,
}: ReviewViewProps) {
  const router = useRouter();
  const [comments, setComments] = useState(draft?.comments ?? []);
  const [newComment, setNewComment] = useState("");
  const [commentSection, setCommentSection] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const sections = (draft?.sections as Array<{ heading: string; body: string; citations: string[] }>) ?? [];
  const strengths = (analysis?.strengths as string[]) ?? [];
  const vulnerabilities = (analysis?.vulnerabilities as string[]) ?? [];

  const handleAddComment = async (section: string | null) => {
    if (!newComment.trim() || !draft) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/drafts/${draft.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          section,
        }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      const { comment } = await res.json();
      setComments([...comments, comment]);
      setNewComment("");
      setCommentSection(null);
      toast.success("Comment added");
      router.refresh();
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setPosting(false);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      const res = await fetch(
        `/api/cases/${caseId}/drafts/${draft!.id}/comments?id=${commentId}`,
        { method: "PATCH" },
      );
      if (!res.ok) throw new Error("Failed to resolve comment");
      setComments(
        comments.map((c) =>
          c.id === commentId ? { ...c, resolved: !c.resolved } : c,
        ),
      );
      toast.success("Comment resolved");
      router.refresh();
    } catch {
      toast.error("Failed to resolve comment");
    }
  };

  const handleExport = async (format: "pdf" | "docx" | "txt") => {
    if (!draft) return;
    setExporting(format);
    try {
      const res = await fetch(
        `/api/cases/${caseId}/drafts/${draft.id}/export?format=${format}`,
      );
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${draft.title.replace(/\s+/g, "_")}.${format}`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(null);
    }
  };

  if (!draft) {
    return (
      <Card className="flex flex-col items-center justify-center py-16">
        <CardContent className="text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No draft to review</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a complaint draft first in the Draft step.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main: Draft content */}
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{draft.title}</CardTitle>
              <Badge variant="secondary">v{draft.version}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {sections.map((section, i) => (
              <div key={i}>
                {i > 0 && <Separator className="mb-6" />}
                <div className="flex items-start justify-between">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
                    {section.heading}
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setCommentSection(
                        commentSection === section.heading
                          ? null
                          : section.heading,
                      )
                    }
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {section.body}
                </div>

                {/* Comment box for this section */}
                {commentSection === section.heading && (
                  <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                    <Textarea
                      placeholder="Add a comment on this section..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCommentSection(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(section.heading)}
                        disabled={posting || !newComment.trim()}
                      >
                        {posting ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="mr-1 h-3 w-3" />
                        )}
                        Comment
                      </Button>
                    </div>
                  </div>
                )}

                {/* Comments for this section */}
                {comments
                  .filter((c) => c.section === section.heading)
                  .map((c) => (
                    <div
                      key={c.id}
                      className={`mt-3 rounded-lg border p-3 ${
                        c.resolved ? "bg-muted/20 opacity-60" : "bg-amber-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium">{c.email}</p>
                          <p className="mt-1 text-sm">{c.content}</p>
                        </div>
                        <button onClick={() => handleResolveComment(c.id)}>
                          {c.resolved ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar: AI Insights + Export + Filing Checklist */}
      <div className="space-y-4">
        {/* AI Insights */}
        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileCheck className="h-4 w-4 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    analysis.claimStrength === "strong"
                      ? "bg-green-100 text-green-800"
                      : analysis.claimStrength === "moderate"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {analysis.claimStrength}
                </Badge>
                <span className="text-xs text-muted-foreground">claim strength</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    analysis.dismissalRisk === "low"
                      ? "bg-green-100 text-green-800"
                      : analysis.dismissalRisk === "medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {analysis.dismissalRisk}
                </Badge>
                <span className="text-xs text-muted-foreground">dismissal risk</span>
              </div>
              {strengths.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-green-700">Strengths</p>
                  <ul className="space-y-1">
                    {strengths.slice(0, 3).map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {vulnerabilities.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-red-700">Vulnerabilities</p>
                  <ul className="space-y-1">
                    {vulnerabilities.slice(0, 3).map((v, i) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        • {v}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-4 w-4" />
              Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => handleExport("pdf")}
              disabled={exporting !== null}
            >
              {exporting === "pdf" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Export as PDF
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => handleExport("docx")}
              disabled={exporting !== null}
            >
              {exporting === "docx" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Export as DOCX
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => handleExport("txt")}
              disabled={exporting !== null}
            >
              {exporting === "txt" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Export as Plain Text
            </Button>
          </CardContent>
        </Card>

        {/* Filing readiness checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCheck className="h-4 w-4" />
              Filing Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ChecklistItem label="Draft generated" done={true} />
            <ChecklistItem
              label="Legal analysis complete"
              done={!!analysis}
            />
            <ChecklistItem
              label="Comments resolved"
              done={comments.length === 0 || comments.every((c) => c.resolved)}
            />
            <ChecklistItem label="Exported for filing" done={false} />
          </CardContent>
        </Card>

        {/* Collaboration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              {comments.length} comment{comments.length !== 1 ? "s" : ""} on this draft
            </p>
            <p className="mt-1">
              {comments.filter((c) => !c.resolved).length} unresolved
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground/40" />
      )}
      <span className={done ? "" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
