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
    <div className="border-b bg-background">
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
                  "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
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
