export type FactsIntakeSamplePrompt = {
  label: string;
  text: string;
};

export const FACTS_INTAKE_SAMPLE_PROMPTS: FactsIntakeSamplePrompt[] = [
  {
    label: "All uploaded documents",
    text: "Analyze every uploaded document in this case. Extract facts, a full timeline, witnesses, and damages. Cite document titles or file paths in each fact source.",
  },
  {
    label: "Chronology from files",
    text: "Build a detailed timeline from all uploads in date order. Add matching facts for each major event and note which document supports each entry.",
  },
  {
    label: "Parties & communications",
    text: "From all documents, identify parties, agents, and key emails or messages. Add facts and timeline entries for each important communication.",
  },
  {
    label: "Damages & amounts",
    text: "Find every dollar amount, cost, fee, or loss in the uploads. Create damages entries with categories and supporting facts tied to source documents.",
  },
  {
    label: "Repairs & service history",
    text: "Summarize repair requests, service visits, warranties, and outcomes using all uploaded records. Emphasize dates and what was (or was not) fixed.",
  },
  {
    label: "Small claims summary",
    text: "Using all uploads, prepare small-claims-ready facts: what happened, when, who is responsible, and total money at stake. Keep statements concise and factual.",
  },
];
