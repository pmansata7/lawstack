"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

const TIPS: Record<string, { title: string; body: string }> = {
  facts: {
    title: "Build the record",
    body: "Run adaptive intake, upload evidence, then AI facts intake. Each fact should tie to a claim element.",
  },
  analysis: {
    title: "Stress-test before drafting",
    body: "Analysis maps facts to elements, merges jurisdiction rule packs, and flags dismissal risk.",
  },
  draft: {
    title: "Draft types",
    body: "Generate complaints, answers, motions, or amended pleadings. Firm templates shape caption and boilerplate.",
  },
  review: {
    title: "Review agent",
    body: "Run the review agent for Iqbal/Twombly scoring, then export or push to integrations.",
  },
};

export function WorkflowTooltip({ step }: { step: keyof typeof TIPS }) {
  const tip = TIPS[step];
  if (!tip) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className="inline-flex text-ink-500 hover:text-navy-950"
          aria-label={tip.title}
        >
          <HelpCircle className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs text-sm">
          <p className="font-medium">{tip.title}</p>
          <p className="mt-1 text-muted-foreground">{tip.body}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
