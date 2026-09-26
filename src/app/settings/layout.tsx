import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen">
      <DashboardSidebar
        orgName={session.orgName}
        orgType={session.orgType}
        email={session.email}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
