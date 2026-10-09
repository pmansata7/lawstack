import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function Footer() {
  return (
    <footer className="border-t border-navy-950/10 bg-paper">
      <div className="container-x flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p className="text-[13px] text-ink-500">
          © {new Date().getFullYear()} Lawstack
        </p>
        <nav className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[13px] font-medium text-ink-700">
          <Link href="/#how-it-works" className="hover:text-navy-950">
            Process
          </Link>
          <Link href="/login" className="hover:text-navy-950">
            Sign in
          </Link>
          <Link href="/signup" className="hover:text-navy-950">
            Start a case
          </Link>
        </nav>
      </div>
    </footer>
  );
}
