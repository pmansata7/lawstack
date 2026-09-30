import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-x flex flex-col gap-4 py-5 text-[12.5px] text-ink-500 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p>Better Pleadings. A Stronger Justice System.</p>
        <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 text-[13px] font-medium text-ink-700">
          <Link href="/#how-it-works" className="hover:text-navy-950">
            How It Works
          </Link>
          <Link href="/login" className="hover:text-navy-950">
            Sign In
          </Link>
          <Link href="/signup" className="hover:text-navy-950">
            Get Started
          </Link>
        </nav>
      </div>
    </footer>
  );
}
