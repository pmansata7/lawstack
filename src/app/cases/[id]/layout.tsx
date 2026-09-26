import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { CaseNav } from "@/components/cases/case-nav";
import Link from "next/link";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CaseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const caseData = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
  });

  if (!caseData) redirect("/dashboard");

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <span className="font-bold">Lawstack</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{caseData.title}</span>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </header>
      <CaseNav caseId={id} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
