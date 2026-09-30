import Link from "next/link";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  showWordmark = true,
}: {
  href?: string;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 text-navy-950", className)}
    >
      <Scale className="h-7 w-7 shrink-0 text-brand-600" strokeWidth={2} />
      {showWordmark && (
        <span className="font-serif text-xl font-semibold tracking-[-0.02em]">
          Lawstack
        </span>
      )}
    </Link>
  );
}
