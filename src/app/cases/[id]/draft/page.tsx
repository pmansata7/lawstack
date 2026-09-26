import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DraftView } from "@/components/cases/draft-view";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function DraftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) return null;
  const { id } = await params;

  const caseData = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
    include: {
      claims: true,
      facts: true,
      evidence: true,
      timeline: { orderBy: { date: "asc" } },
      witnesses: true,
      damages: true,
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      drafts: {
        orderBy: { createdAt: "desc" },
        include: { comments: true },
      },
    },
  });

  if (!caseData) notFound();

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Draft Your Pleading</h1>
          <p className="text-muted-foreground">
            Generate a structured complaint with citations and legal precision.
          </p>
        </div>
        {caseData.drafts.length > 0 && (
          <Button asChild>
            <Link href={`/cases/${id}/review`}>
              Continue to Review & File
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <DraftView caseId={id} caseData={caseData} />
    </div>
  );
}
