import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function DesignPartner() {
  return (
    <section
      id="design-partner"
      className="relative scroll-mt-20 overflow-hidden bg-partner-gradient py-20 text-white lg:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_85%_50%,rgba(95,149,242,0.18),transparent_70%)]"
        aria-hidden
      />
      <div className="container-x relative">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="eyebrow text-white/80">Early access</p>
          <h2 className="heading-serif mt-4 text-[36px] leading-[1.08] text-white sm:text-[42px] lg:text-[46px]">
            Be a Design Partner
          </h2>
          <p className="mt-4 max-w-[560px] mx-auto text-[16px] leading-[1.65] text-white/85">
            We&apos;re working with a select group of law firms and courts to
            shape the future of Lawstack. Apply to be a design partner and get
            early access.
          </p>
          <Button
            size="lg"
            className="mt-8 h-11 rounded-lg bg-white px-6 text-[13.5px] font-semibold text-navy-950 hover:bg-white/90"
            asChild
          >
            <Link href="/signup?partner=1">Apply Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
