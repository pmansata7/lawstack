const STEPS = [
  {
    number: "01",
    title: "Open the matter",
    description:
      "Parties, court, and claims—pulled from templates, not scratch.",
  },
  {
    number: "02",
    title: "Build the record",
    description:
      "Timeline, uploads, witnesses, damages—each item tagged to the file.",
  },
  {
    number: "03",
    title: "Stress-test the theory",
    description:
      "Map facts to elements; flag gaps before opposing counsel does.",
  },
  {
    number: "04",
    title: "Draft the pleading",
    description:
      "Generate a structured complaint with citations where you need them.",
  },
  {
    number: "05",
    title: "Review and export",
    description:
      "Comments, revisions, PDF/DOCX—then file with confidence.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-16 border-b border-navy-950/10 bg-paper py-20 lg:py-24"
    >
      <div className="container-x">
        <div className="max-w-xl">
          <p className="eyebrow">Process</p>
          <h2 className="heading-serif mt-4 text-[34px] leading-[1.06] sm:text-[40px] lg:text-[44px]">
            Five stops from intake to export.
          </h2>
        </div>

        <ol className="mt-14 space-y-0 border-t border-navy-950/10">
          {STEPS.map((step) => (
            <li
              key={step.number}
              className="grid gap-4 border-b border-navy-950/10 py-8 sm:grid-cols-[4.5rem_1fr] sm:gap-8"
            >
              <span className="font-mono text-[13px] font-medium text-ink-500">
                {step.number}
              </span>
              <div>
                <h3 className="font-serif text-[22px] font-semibold text-navy-950">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-2xl text-[15px] leading-[1.65] text-ink-600">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
