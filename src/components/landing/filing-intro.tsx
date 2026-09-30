export function FilingIntro() {
  return (
    <section className="relative bg-white py-20 lg:py-24">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[minmax(0,46fr)_minmax(0,54fr)] lg:gap-16">
        <div>
          <p className="eyebrow text-ink-400">Turn facts into</p>
          <p className="eyebrow mt-1 text-brand-600">file-ready pleadings.</p>
          <h2 className="heading-serif mt-5 text-balance text-[36px] leading-[1.08] sm:text-[42px] lg:text-[46px]">
            Turn facts into
            <br />
            file-ready pleadings.
          </h2>
          <p className="mt-5 max-w-[540px] text-pretty text-[16px] leading-[1.65] text-ink-600 lg:text-[17px]">
            Lawstack structures your case from the start, so your complaint is
            fact-driven, evidence-backed, and legally sound.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Fact-driven structure",
              body: "Every allegation ties back to organized facts and evidence from day one.",
            },
            {
              title: "Evidence-backed claims",
              body: "Documents, witnesses, and timelines stay linked to the elements you need to prove.",
            },
            {
              title: "Procedural precision",
              body: "Jurisdiction, parties, and relief are drafted with court-ready formatting.",
            },
            {
              title: "Motion-ready output",
              body: "Reduce dismissal risk with analysis aligned to Iqbal/Twombly standards.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(7,20,51,0.03)]"
            >
              <h3 className="font-serif text-[19px] font-semibold text-navy-950">
                {item.title}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-ink-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
