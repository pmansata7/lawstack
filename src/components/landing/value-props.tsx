const VALUE_PROPS = [
  {
    title: "One case thread",
    description: "Facts, evidence, analysis, and draft live in the same file.",
  },
  {
    title: "Element mapping",
    description: "See what is proved, thin, or missing before you file.",
  },
  {
    title: "Less rework",
    description: "Export a structured complaint instead of rebuilding from notes.",
  },
  {
    title: "Team-ready",
    description: "Built for firms, in-house teams, and court staff workflows.",
  },
];

export function ValueProps() {
  return (
    <section className="border-b border-navy-950/10 bg-tint py-14 lg:py-16">
      <div className="container-x">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-navy-950/10">
          {VALUE_PROPS.map((prop) => (
            <div key={prop.title} className="lg:px-8 first:lg:pl-0 last:lg:pr-0">
              <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-navy-950">
                {prop.title}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-ink-600">
                {prop.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
