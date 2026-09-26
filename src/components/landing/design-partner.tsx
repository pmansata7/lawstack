import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function DesignPartner() {
  return (
    <section id="design-partner" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-primary/5 p-12 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Be a Design Partner
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We&apos;re working with a select group of law firms and courts to
              shape the future of Lawstack. Apply to be a design partner and
              get early access.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/signup?partner=1">Apply Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
