"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  FolderOpen,
  Brain,
  PenLine,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { href: "setup", label: "Setup", icon: Settings },
  { href: "facts", label: "Facts & Evidence", icon: FolderOpen },
  { href: "analysis", label: "Legal Analysis", icon: Brain },
  { href: "draft", label: "Draft", icon: PenLine },
  { href: "review", label: "Review & File", icon: FileCheck },
];

export function CaseNav({ caseId }: { caseId: string }) {
  const pathname = usePathname();

  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4">
        <nav className="flex gap-1 overflow-x-auto">
          {STEPS.map((step) => {
            const href = `/cases/${caseId}/${step.href}`;
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={step.href}
                href={href}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-ink-500 hover:text-navy-950",
                )}
              >
                <step.icon className="h-4 w-4" />
                {step.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
