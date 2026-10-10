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
import { Plus, FolderOpen } from "lucide-react";
import { DashboardCaseCard } from "@/components/dashboard/case-card";
import { DashboardHomeIntro } from "@/components/dashboard/dashboard-home";

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
      <DashboardHomeIntro />

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
              Paste a client narrative for AI intake, or load the example matter
              from the checklist above.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/dashboard/cases/new">
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Case
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <DashboardCaseCard
              key={c.id}
              id={c.id}
              title={c.title}
              status={c.status}
              courtType={c.courtType}
              jurisdiction={c.jurisdiction}
              counts={{
                facts: c._count.facts,
                evidence: c._count.evidence,
                analyses: c._count.analyses,
                drafts: c._count.drafts,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
