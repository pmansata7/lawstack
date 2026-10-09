const STATS = [
  {
    value: "60%",
    label: "less time on first drafts",
    note: "Based on design-partner interviews",
  },
  {
    value: "Earlier",
    label: "visibility into 12(b)(6) gaps",
    note: "Before service, not after",
  },
  {
    value: "One",
    label: "source of truth per case",
    note: "Facts through export",
  },
];

export function Stats() {
  return (
    <section className="border-b border-navy-950/10 bg-navy-950 py-20 text-white lg:py-24">
      <div className="container-x">
        <div className="max-w-xl">
          <h2 className="font-serif text-[34px] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-[40px]">
            Measure what matters before you file.
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-white/75">
            Teams use Lawstack to catch thin allegations early and ship cleaner
            first filings.
          </p>
        </div>

        <dl className="mt-14 grid gap-10 border-t border-white/15 pt-14 md:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="font-serif text-[36px] font-semibold leading-none sm:text-[42px]">
                {stat.value}
              </dt>
              <dd className="mt-3 text-[15px] font-medium text-white">
                {stat.label}
              </dd>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                {stat.note}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
