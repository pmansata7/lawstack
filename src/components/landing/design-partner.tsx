import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DesignPartner() {
  return (
    <section
      id="design-partner"
      className="scroll-mt-16 border-t border-navy-950/10 bg-tint py-20 lg:py-24"
    >
      <div className="container-x">
        <div className="border-hard max-w-2xl bg-white p-10 sm:p-12">
          <p className="eyebrow">Design partners</p>
          <h2 className="heading-serif mt-4 text-[32px] leading-[1.08] sm:text-[36px]">
            Help shape the product—and get in early.
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-ink-600">
            We work with a small set of firms and courts on real matters. If
            that sounds like you, tell us what your docket needs.
          </p>
          <Button
            className="mt-8 h-11 rounded-md bg-navy-950 px-6 text-[13px] font-semibold hover:bg-navy-900"
            asChild
          >
            <Link href="/signup?partner=1">Apply</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
