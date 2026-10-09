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
      className={cn("inline-flex items-center gap-2.5 text-navy-950", className)}
    >
      <Scale className="h-6 w-6 shrink-0 text-navy-950" strokeWidth={1.75} />
      {showWordmark && (
        <span className="font-serif text-lg font-semibold tracking-[-0.03em]">
          Lawstack
        </span>
      )}
    </Link>
  );
}
