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
    <section id="how-it-works" className="scroll-mt-20 bg-white py-20 lg:py-24">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-brand-600">How Lawstack works</p>
          <h2 className="heading-serif mt-4 text-balance text-[36px] leading-[1.08] sm:text-[42px] lg:text-[46px]">
            A clearer path to a stronger case
          </h2>
        </div>

        <div className="mt-16">
          <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-5">
            {STEPS.map((step, idx) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center"
              >
                {idx < STEPS.length - 1 && (
                  <div className="absolute left-1/2 top-5 hidden h-px w-full translate-x-1/2 bg-brand-200 lg:block" />
                )}
                <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[13px] font-semibold text-white shadow-[0_4px_12px_-4px_rgba(0,88,232,0.5)]">
                  {step.number}
                </div>
                <div className="mt-4 flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <h3 className="text-[15px] font-semibold text-navy-950">
                    {step.title}
                  </h3>
                  <p className="text-[14px] leading-[1.6] text-ink-600">
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
