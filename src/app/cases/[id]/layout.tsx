import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getCaseForOrganization } from "@/lib/cases/get-case-for-org";
import { CaseNav } from "@/components/cases/case-nav";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
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

  let caseData;
  try {
    caseData = await getCaseForOrganization(id, session.orgId);
  } catch (error) {
    console.error("Case layout load error:", error);
    throw error;
  }

  if (!caseData) redirect("/dashboard");

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-line bg-white px-4">
        <div className="flex items-center gap-3">
          <Logo href="/dashboard" showWordmark={false} />
          <span className="text-ink-400">/</span>
          <span className="font-medium text-navy-950">{caseData.title}</span>
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
