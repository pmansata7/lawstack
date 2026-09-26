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
    description:
      "Draft complaints designed to withstand dismissal.",
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
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((prop) => (
            <div key={prop.title} className="flex flex-col gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <prop.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{prop.title}</h3>
              <p className="text-sm text-muted-foreground">
                {prop.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
