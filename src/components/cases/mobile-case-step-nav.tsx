"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { href: "setup", label: "Setup" },
  { href: "facts", label: "Facts" },
  { href: "analysis", label: "Analysis" },
  { href: "draft", label: "Draft" },
  { href: "review", label: "Review" },
];

export function MobileCaseStepNav({ caseId }: { caseId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex overflow-x-auto">
      {STEPS.map((step) => {
        const href = `/cases/${caseId}/${step.href}`;
        const isActive =
          pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={step.href}
            href={href}
            className={cn(
              "shrink-0 border-t-2 px-4 py-2.5 text-[12px] font-medium",
              isActive
                ? "border-navy-950 text-navy-950"
                : "border-transparent text-ink-500",
            )}
          >
            {step.label}
          </Link>
        );
      })}
    </nav>
  );
}
