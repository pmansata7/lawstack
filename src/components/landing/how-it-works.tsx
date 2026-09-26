import {
  FileText,
  FolderOpen,
  Brain,
  PenLine,
  CheckCircle2,
} from "lucide-react";

const STEPS = [
  {
    number: 1,
    icon: FileText,
    title: "Set up your case",
    description:
      "Enter key details, choose jurisdiction, and define your claims.",
  },
  {
    number: 2,
    icon: FolderOpen,
    title: "Organize facts & evidence",
    description:
      "Upload documents, add timelines, witnesses, and supporting materials.",
  },
  {
    number: 3,
    icon: Brain,
    title: "AI legal analysis",
    description:
      "Map facts to legal elements and identify potential vulnerabilities.",
  },
  {
    number: 4,
    icon: PenLine,
    title: "Draft your pleading",
    description:
      "Generate a structured complaint with citations and legal precision.",
  },
  {
    number: 5,
    icon: CheckCircle2,
    title: "Review & file",
    description:
      "Refine, collaborate, and export for filing in state or federal court.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            A clearer path to a stronger case
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            How Lawstack works
          </p>
        </div>

        <div className="mt-16">
          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-5">
            {STEPS.map((step, idx) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-px w-full translate-x-1/2 bg-border lg:block" />
                )}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Step {step.number}
                  </span>
                  <h3 className="text-base font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
