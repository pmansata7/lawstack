"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "Process" },
  { href: "/#law-firms", label: "Teams" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-navy-950/10 bg-paper">
      <div className="container-x flex h-14 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-ink-700 transition-colors hover:text-navy-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="h-9 px-3 text-[13px] font-medium text-ink-700 hover:bg-tint hover:text-navy-950"
            asChild
          >
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            className="h-9 rounded-md bg-navy-950 px-4 text-[13px] font-semibold hover:bg-navy-900"
            asChild
          >
            <Link href="/signup">Start a case</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
