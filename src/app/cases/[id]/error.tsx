"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CaseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Case route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 p-12 text-center">
      <h1 className="text-xl font-semibold">This case couldn&apos;t load</h1>
      <p className="text-sm text-muted-foreground">
        Something went wrong loading case data. If you just created this case,
        confirm the database schema is up to date (`npx prisma db push`) and try
        again.
      </p>
      <div className="flex gap-3">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
