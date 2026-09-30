import Link from "next/link";
import { Building2, Briefcase, Landmark, ChevronRight } from "lucide-react";

const AUDIENCES = [
  {
    id: "law-firms",
    icon: Building2,
    title: "Law Firms",
    description:
      "Draft stronger pleadings, faster. Improve outcomes and client satisfaction.",
    cta: "Learn More",
  },
  {
    id: "in-house",
    icon: Briefcase,
    title: "In-House Legal",
    description:
      "Handle disputes efficiently with litigation-ready pleadings.",
    cta: "Learn More",
  },
  {
    id: "courts",
    icon: Landmark,
    title: "Courts",
    description:
      "Support clearer, better-organized filings and more efficient dockets.",
    cta: "Learn More",
  },
];

export function Audiences() {
  return (
    <section className="scroll-mt-20 bg-white py-20 lg:py-24">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="heading-serif text-[36px] leading-[1.08] sm:text-[42px] lg:text-[46px]">
            A platform for every legal team.
          </h2>
          <p className="mt-5 text-pretty text-[16px] leading-[1.65] text-ink-600 lg:text-[17px]">
            Different users. A stronger justice system.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {AUDIENCES.map((aud) => (
            <div
              key={aud.id}
              id={aud.id}
              className="group flex flex-col rounded-xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(7,20,51,0.03)] transition-shadow duration-300 hover:shadow-[0_8px_24px_-8px_rgba(7,20,51,0.12)]"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <aud.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-[22px] font-semibold text-navy-950">
                {aud.title}
              </h3>
              <p className="mt-2 flex-1 text-[14px] leading-[1.6] text-ink-600">
                {aud.description}
              </p>
              <Link
                href={`/signup?type=${aud.id}`}
                className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                {aud.cta}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
