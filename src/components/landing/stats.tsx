import { TrendingDown, ShieldOff, TrendingUp } from "lucide-react";

const STATS = [
  {
    icon: TrendingDown,
    value: "60%",
    highlight: "less time drafting",
    sublabel: "initial pleadings",
  },
  {
    icon: ShieldOff,
    value: "Fewer",
    highlight: "motions to dismiss",
    sublabel: "and demurrers",
  },
  {
    icon: TrendingUp,
    value: "Stronger",
    highlight: "case outcomes",
    sublabel: "",
  },
];

export function Stats() {
  return (
    <section className="relative border-y border-line bg-tint py-20 lg:py-24">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="heading-serif text-[36px] leading-[1.08] sm:text-[42px] lg:text-[46px]">
            Better pleadings. Better outcomes.
          </h2>
          <p className="mt-5 max-w-[500px] mx-auto text-pretty text-[16px] leading-[1.65] text-ink-600 lg:text-[17px]">
            Law firms and courts use Lawstack to reduce motion risk, improve
            efficiency, and deliver stronger results for their clients.
          </p>
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.highlight}
              className="flex flex-col items-center text-center"
            >
              <div className="flex size-11 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-serif text-[30px] font-semibold leading-none text-brand-600 sm:text-[34px] lg:text-[38px]">
                {stat.value}
              </div>
              <div className="mt-2 text-[15px] font-semibold text-navy-950">
                {stat.highlight}
              </div>
              {stat.sublabel && (
                <div className="text-[13px] text-ink-500">{stat.sublabel}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
