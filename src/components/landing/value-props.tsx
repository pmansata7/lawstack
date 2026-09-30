import {
  FolderOpen,
  ShieldCheck,
  Clock,
  Building2,
} from "lucide-react";

const VALUE_PROPS = [
  {
    icon: FolderOpen,
    title: "Organize facts",
    description: "Capture and structure key facts with supporting evidence.",
  },
  {
    icon: ShieldCheck,
    title: "Stronger pleadings",
    description: "Draft complaints designed to withstand dismissal.",
  },
  {
    icon: Clock,
    title: "Save time",
    description:
      "Automate the heavy lifting so you can focus on strategy.",
  },
  {
    icon: Building2,
    title: "Built for legal teams",
    description: "For law firms, in-house counsel, and courts.",
  },
];

export function ValueProps() {
  return (
    <section className="border-y border-line bg-surface py-16 lg:py-20">
      <div className="container-x">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((prop) => (
            <div key={prop.title} className="group flex flex-col gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 ring-1 ring-brand-200/60">
                <prop.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-navy-950">
                {prop.title}
              </h3>
              <p className="text-[14px] leading-[1.6] text-ink-600">
                {prop.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
