import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Gavel } from "lucide-react";

export default async function CaseSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) return null;
  const { id } = await params;

  const caseData = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
    include: { claims: true },
  });

  if (!caseData) notFound();

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Case Setup</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow label="Title" value={caseData.title} />
            <DetailRow
              label="Court Type"
              value={caseData.courtType === "FEDERAL" ? "Federal" : "State"}
            />
            <DetailRow label="Jurisdiction" value={caseData.jurisdiction} />
            <DetailRow label="Court Name" value={caseData.courtName ?? "—"} />
            <DetailRow label="Case Number" value={caseData.caseNumber ?? "—"} />
            <DetailRow label="Plaintiff" value={caseData.plaintiff ?? "—"} />
            <DetailRow label="Defendant" value={caseData.defendant ?? "—"} />
            <DetailRow
              label="Opposing Party"
              value={caseData.opposingParty ?? "—"}
            />
            <Separator />
            <DetailRow
              label="Status"
              value={
                <Badge variant="secondary">{caseData.status}</Badge>
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claims ({caseData.claims.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {caseData.claims.map((claim) => {
              const elements = claim.elements as Array<{
                element: string;
                description: string;
                satisfied: boolean;
              }>;
              return (
                <div key={claim.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Gavel className="h-4 w-4 text-primary" />
                    <span className="font-medium">{claim.claimType}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {elements?.map((e) => (
                      <div
                        key={e.element}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${e.satisfied ? "bg-green-500" : "bg-muted-foreground/30"}`}
                        />
                        {e.element}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Button asChild>
          <Link href={`/cases/${id}/facts`}>
            Continue to Facts & Evidence
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
