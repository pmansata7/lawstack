const PILLARS = [
  {
    title: "Fact-driven structure",
    body: "Each allegation points to a fact row in the record—not a blank paragraph.",
  },
  {
    title: "Evidence on the line",
    body: "Documents, witnesses, and dates stay attached to the elements you must prove.",
  },
  {
    title: "Procedure baked in",
    body: "Caption, parties, jurisdiction, and prayer follow the format clerks expect.",
  },
  {
    title: "Motion-aware review",
    body: "Gap checks against Iqbal/Twombly before you export—not after a 12(b)(6).",
  },
];

export function FilingIntro() {
  return (
    <section className="border-b border-navy-950/10 bg-paper py-20 lg:py-24">
      <div className="container-x">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow">From intake to filing</p>
            <h2 className="heading-serif mt-4 text-balance text-[34px] leading-[1.06] sm:text-[40px] lg:text-[44px]">
              Pleadings built from the record up.
            </h2>
            <p className="mt-5 max-w-md text-pretty text-[16px] leading-[1.7] text-ink-600">
              Most tools start with a blank Word doc. Lawstack starts with what
              happened, what you can prove, and what the rule requires.
            </p>
          </div>

          <ol className="divide-y divide-navy-950/10 border-y border-navy-950/10">
            {PILLARS.map((item, index) => (
              <li
                key={item.title}
                className="grid gap-4 py-8 sm:grid-cols-[3rem_1fr] sm:gap-6"
              >
                <span
                  className="font-mono text-[13px] font-medium tabular-nums text-ink-500"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-serif text-[20px] font-semibold text-navy-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-[1.65] text-ink-600">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
