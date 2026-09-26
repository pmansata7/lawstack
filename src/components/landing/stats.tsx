import { TrendingDown, ShieldOff, TrendingUp } from "lucide-react";

const STATS = [
  {
    icon: TrendingDown,
    value: "60%",
    label: "less time drafting initial pleadings",
  highlight: "less time drafting",
  sublabel: "initial pleadings",
  },
  {
    icon: ShieldOff,
    value: "Fewer",
    label: "motions to dismiss and demurrers",
    highlight: "motions to dismiss",
    sublabel: "and demurrers",
  },
  {
    icon: TrendingUp,
    value: "Stronger",
    label: "case outcomes",
    highlight: "case outcomes",
    sublabel: "",
  },
];

export function Stats() {
  return (
    <section className="border-y bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Better pleadings. Better outcomes.
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Law firms and courts use Lawstack to reduce motion risk, improve
            efficiency, and deliver stronger results for their clients.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center"
            >
              <stat.icon className="mb-3 h-8 w-8 text-primary-foreground/60" />
              <div className="text-4xl font-bold">{stat.value}</div>
              <div className="mt-2 text-sm text-primary-foreground/80">
                {stat.highlight}
              </div>
              {stat.sublabel && (
                <div className="text-xs text-primary-foreground/60">
                  {stat.sublabel}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
