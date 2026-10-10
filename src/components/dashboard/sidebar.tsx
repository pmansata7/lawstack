"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  LogOut,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/cases", label: "Cases", icon: FolderOpen },
  { href: "/settings/ai", label: "AI Settings", icon: Brain },
  { href: "/settings/templates", label: "Templates", icon: FolderOpen },
  { href: "/settings/integrations", label: "Integrations", icon: Settings },
  { href: "/settings/analytics", label: "Analytics", icon: Brain },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({
  orgName,
  orgType,
  email,
}: {
  orgName: string;
  orgType: string;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-line bg-surface">
      <div className="flex h-16 items-center border-b border-line px-6">
        <Logo href="/dashboard" />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-navy-950 text-white"
                  : "text-ink-600 hover:bg-tint hover:text-navy-950",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-4">
        <div className="mb-3 rounded-lg border border-line bg-white p-3">
          <p className="text-sm font-semibold text-navy-950">{orgName}</p>
          <p className="text-xs text-ink-500">
            {orgType === "LAW_FIRM"
              ? "Law Firm"
              : orgType === "IN_HOUSE"
                ? "In-House Legal"
                : "Court"}
          </p>
          <p className="mt-1 truncate text-xs text-ink-500">{email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-ink-600 hover:bg-brand-50 hover:text-navy-950"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
