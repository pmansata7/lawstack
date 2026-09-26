"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Scale className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">Lawstack</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How It Works
          </Link>
          <Link
            href="/#law-firms"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Law Firms
          </Link>
          <Link
            href="/#in-house"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            In-House
          </Link>
          <Link
            href="/#courts"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Courts
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
