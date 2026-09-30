"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#law-firms", label: "Law Firms" },
  { href: "/#in-house", label: "In-House" },
  { href: "/#courts", label: "Courts" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/85 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between lg:h-[4.5rem]">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13.5px] font-medium text-ink-700 transition-colors hover:text-navy-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-[13.5px] font-medium text-ink-700 hover:bg-brand-50 hover:text-navy-950"
            asChild
          >
            <Link href="/login">Sign In</Link>
          </Button>
          <Button
            className="h-10 rounded-lg bg-brand-600 px-5 text-[13.5px] font-semibold shadow-[0_8px_20px_-10px_rgba(0,88,232,0.7)] hover:bg-brand-700"
            asChild
          >
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
