import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, FolderOpen, Brain, PenLine } from "lucide-react";

const dashboardCaseInclude = {
  _count: {
    select: {
      facts: true,
      evidence: true,
      drafts: true,
      analyses: true,
    },
  },
} satisfies Prisma.CaseInclude;

type DashboardCase = Prisma.CaseGetPayload<{
  include: typeof dashboardCaseInclude;
}>;

const STATUS_LABELS: Record<string, string> = {
  SETUP: "Setting Up",
  FACTS: "Organizing Facts",
  ANALYSIS: "Legal Analysis",
  DRAFTING: "Drafting",
  REVIEW: "In Review",
  FILED: "Filed",
};

const STATUS_COLORS: Record<string, string> = {
  SETUP: "bg-blue-100 text-blue-800",
  FACTS: "bg-purple-100 text-purple-800",
  ANALYSIS: "bg-amber-100 text-amber-800",
  DRAFTING: "bg-indigo-100 text-indigo-800",
  REVIEW: "bg-orange-100 text-orange-800",
  FILED: "bg-green-100 text-green-800",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let cases: DashboardCase[] = [];
  let loadError: string | null = null;

  try {
    cases = await prisma.case.findMany({
      where: { organizationId: session.orgId },
      orderBy: { updatedAt: "desc" },
      include: dashboardCaseInclude,
    });
  } catch (error) {
    console.error("Dashboard cases load error:", error);
    loadError =
      "Could not load cases. Confirm the database schema is up to date (run `npx prisma db push`).";
  }

  return (
    <div className="p-8">
      {loadError && (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-navy-950">
            Dashboard
          </h1>
          <p className="text-ink-600">
            Welcome back to {session.orgName}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/cases/new">
            <Plus className="mr-2 h-4 w-4" /> New Case
          </Link>
        </Button>
      </div>

      {cases.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <CardContent className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-navy-950/10 bg-tint text-navy-950">
              <FolderOpen className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">No cases yet</h3>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">
              Create your first case to start building a stronger pleading.
            </p>
            <Button asChild>
              <Link href="/dashboard/cases/new">
                <Plus className="mr-2 h-4 w-4" /> Create Your First Case
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <Link key={c.id} href={`/cases/${c.id}/setup`}>
              <Card className="cursor-pointer border-line transition-shadow hover:shadow-[0_8px_24px_-8px_rgba(7,20,51,0.12)]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                    <Badge
                      variant="secondary"
                      className={STATUS_COLORS[c.status]}
                    >
                      {STATUS_LABELS[c.status]}
                    </Badge>
                  </div>
                  <CardDescription>
                    {c.courtType === "FEDERAL"
                      ? "Federal"
                      : c.courtType === "SMALL_CLAIMS"
                        ? "Small Claims"
                        : "State"}{" "}
                    Court —{" "}
                    {c.jurisdiction}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {c._count.facts} facts
                    </span>
                    <span className="flex items-center gap-1">
                      <FolderOpen className="h-3.5 w-3.5" />
                      {c._count.evidence} evidence
                    </span>
                    <span className="flex items-center gap-1">
                      <Brain className="h-3.5 w-3.5" />
                      {c._count.analyses} analyses
                    </span>
                    <span className="flex items-center gap-1">
                      <PenLine className="h-3.5 w-3.5" />
                      {c._count.drafts} drafts
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
