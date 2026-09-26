import Link from "next/link";
import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <span className="font-bold">Lawstack</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Better Pleadings. A Stronger Justice System.
          </p>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/#how-it-works" className="hover:text-foreground">
              How It Works
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
