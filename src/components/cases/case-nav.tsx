"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  FolderOpen,
  Brain,
  PenLine,
  FileCheck,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { href: "setup", label: "Setup", icon: Settings },
  { href: "facts", label: "Facts & evidence", icon: FolderOpen },
  { href: "analysis", label: "Legal analysis", icon: Brain },
  { href: "draft", label: "Draft", icon: PenLine },
  { href: "review", label: "Review & file", icon: FileCheck },
];

export function CaseNav({
  caseId,
  caseTitle,
}: {
  caseId: string;
  caseTitle: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      className="flex w-[15.5rem] shrink-0 flex-col border-r border-navy-950/10 bg-paper"
    >
      <div className="border-b border-navy-950/10 px-4 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          Matter
        </p>
        <p className="mt-1 line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-navy-950">
          {caseTitle}
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {STEPS.map((step) => {
          const href = `/cases/${caseId}/${step.href}`;
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={step.href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-navy-950 text-white"
                  : "text-ink-600 hover:bg-tint hover:text-navy-950",
              )}
            >
              <step.icon className="h-4 w-4 shrink-0 opacity-90" />
              <span className="leading-tight">{step.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-navy-950/10 p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-ink-600 hover:bg-tint hover:text-navy-950"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      </div>
    </aside>
  );
}
