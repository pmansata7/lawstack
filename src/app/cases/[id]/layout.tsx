import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getCaseForOrganization } from "@/lib/cases/get-case-for-org";
import { CaseNavWithWorkflow } from "@/components/cases/case-nav-workflow";
import { CaseChatPanel } from "@/components/cases/case-chat-panel";
import { MobileCaseStepNav } from "@/components/cases/mobile-case-step-nav";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

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
    caseData = await getCaseForOrganization(id, session.orgId, {
      _count: {
        select: {
          claims: true,
          facts: true,
          evidence: true,
          analyses: true,
          drafts: true,
        },
      },
    });
  } catch (error) {
    console.error("Case layout load error:", error);
    throw error;
  }

  if (!caseData) redirect("/dashboard");

  return (
    <div className="flex h-screen flex-col bg-paper">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-navy-950/10 bg-paper px-4 lg:hidden">
        <Logo href="/dashboard" showWordmark={false} />
        <Link
          href="/dashboard"
          className="text-[13px] font-medium text-ink-600 hover:text-navy-950"
        >
          Dashboard
        </Link>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="hidden lg:flex">
          <CaseNavWithWorkflow
            caseId={id}
            caseTitle={caseData.title}
            claimCount={caseData._count.claims}
            factsCount={caseData._count.facts}
            evidenceCount={caseData._count.evidence}
            analysesCount={caseData._count.analyses}
            draftsCount={caseData._count.drafts}
            caseStatus={caseData.status}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1">
          <main className="min-h-0 flex-1 overflow-auto">{children}</main>
          <CaseChatPanel caseId={id} />
        </div>
      </div>

      <div className="shrink-0 border-t border-navy-950/10 bg-paper lg:hidden">
        <MobileCaseStepNav caseId={id} />
      </div>
    </div>
  );
}
