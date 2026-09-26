import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FactsTabs } from "@/components/cases/facts-tabs";

export default async function FactsPage({
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
      facts: { orderBy: { createdAt: "desc" } },
      evidence: { orderBy: { createdAt: "desc" } },
      timeline: { orderBy: { date: "asc" } },
      witnesses: { orderBy: { createdAt: "desc" } },
      damages: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!caseData) notFound();

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Facts & Evidence</h1>
        <p className="text-muted-foreground">
          Capture and structure key facts with supporting evidence.
        </p>
      </div>

      <FactsTabs caseId={id} initialData={caseData} />
    </div>
  );
}
