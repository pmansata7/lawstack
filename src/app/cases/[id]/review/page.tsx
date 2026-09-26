import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReviewView } from "@/components/cases/review-view";

export default async function ReviewPage({
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
      drafts: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          comments: { orderBy: { createdAt: "asc" } },
        },
      },
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      organization: { include: { members: true } },
    },
  });

  if (!caseData) notFound();

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Review & File</h1>
        <p className="text-muted-foreground">
          Refine, collaborate, and export for filing in state or federal court.
        </p>
      </div>

      <ReviewView
        caseId={id}
        draft={caseData.drafts[0]}
        analysis={caseData.analyses[0]}
        userEmail={session.email}
        userId={session.id}
      />
    </div>
  );
}
