import type { NarrativeSamplePrompt } from "@/components/ai/narrative-intake-card";

export const CASE_INTAKE_SAMPLE_PROMPTS: NarrativeSamplePrompt[] = [
  {
    label: "Security deposit (small claims)",
    text:
      "My landlord kept my $2,000 security deposit after I moved out of my Oakland apartment. I left the unit clean on March 1, 2025, but they never returned the deposit or sent an itemized statement within 21 days.",
  },
  {
    label: "Warehouse injury (negligence)",
    text:
      "I was delivering goods to Acme Corp’s warehouse when a forklift struck me. Acme had prior OSHA citations for unsafe forklift use. I fractured my tibia, missed six months of work, and have ongoing medical bills.",
  },
  {
    label: "Breach of contract",
    text:
      "We signed a software license with Beta LLC for $120k/year. They stopped providing updates in June 2025 and refused a refund after repeated breach notices. We need to sue in California state court.",
  },
];
