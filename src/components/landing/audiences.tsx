import Link from "next/link";

const AUDIENCES = [
  {
    id: "law-firms",
    title: "Law firms",
    description:
      "Associates stop rebuilding the same fact matrix in Word for every new matter.",
    href: "/signup?type=law-firms",
  },
  {
    id: "in-house",
    title: "In-house",
    description:
      "Disputes get a litigation-ready file without handing everything to outside counsel day one.",
    href: "/signup?type=in-house",
  },
  {
    id: "courts",
    title: "Courts",
    description:
      "Clearer organization on the clerk’s side—fewer back-and-forth requests for missing pieces.",
    href: "/signup?type=courts",
  },
];

export function Audiences() {
  return (
    <section className="scroll-mt-16 bg-paper py-20 lg:py-24" id="teams">
      <div className="container-x">
        <div className="max-w-xl">
          <p className="eyebrow">Who it’s for</p>
          <h2 className="heading-serif mt-4 text-[34px] leading-[1.06] sm:text-[40px]">
            Same workflow, different docket pressure.
          </h2>
        </div>

        <div className="mt-12 grid gap-0 border border-navy-950/10 md:grid-cols-3">
          {AUDIENCES.map((aud) => (
            <article
              key={aud.id}
              id={aud.id}
              className="flex flex-col border-b border-navy-950/10 p-8 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
            >
              <h3 className="font-serif text-[22px] font-semibold text-navy-950">
                {aud.title}
              </h3>
              <p className="mt-3 flex-1 text-[15px] leading-[1.65] text-ink-600">
                {aud.description}
              </p>
              <Link
                href={aud.href}
                className="mt-6 inline-flex text-[13px] font-semibold text-navy-950 underline decoration-navy-950/30 underline-offset-4 hover:decoration-navy-950"
              >
                Request access
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
