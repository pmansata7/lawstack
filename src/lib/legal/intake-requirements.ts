export type IntakeQuestion = {
  id: string;
  prompt: string;
  category: "parties" | "jurisdiction" | "facts" | "damages" | "evidence" | "procedure";
  requiredForClaims?: string[];
  evidenceHint?: string;
};

const BASE_QUESTIONS: IntakeQuestion[] = [
  {
    id: "incident_date",
    prompt: "When did the key incident or breach occur (exact or approximate date)?",
    category: "facts",
  },
  {
    id: "venue_facts",
    prompt:
      "Where did events occur (city/county/state) and why should this court have jurisdiction?",
    category: "jurisdiction",
  },
  {
    id: "opposing_identity",
    prompt:
      "Who is the opposing party (legal name) and their role (employer, landlord, vendor, etc.)?",
    category: "parties",
  },
  {
    id: "damages_amount",
    prompt: "What damages are you seeking (categories and approximate amounts)?",
    category: "damages",
  },
  {
    id: "key_documents",
    prompt: "What documents or messages support your version (contracts, emails, photos, medical records)?",
    category: "evidence",
    evidenceHint: "Upload or list filenames you can provide.",
  },
];

const CLAIM_SPECIFIC: Record<string, IntakeQuestion[]> = {
  security_deposit: [
    {
      id: "move_out_date",
      prompt: "When did you move out and return keys?",
      category: "facts",
      requiredForClaims: ["security_deposit"],
    },
    {
      id: "itemized_statement",
      prompt: "Did the landlord send an itemized deduction statement within the statutory period?",
      category: "procedure",
      requiredForClaims: ["security_deposit"],
    },
  ],
  negligence: [
    {
      id: "duty_breach",
      prompt: "What duty did the defendant owe and how was it breached?",
      category: "facts",
      requiredForClaims: ["negligence"],
    },
    {
      id: "causation_link",
      prompt: "How did the breach directly cause your injury or loss?",
      category: "facts",
      requiredForClaims: ["negligence"],
    },
  ],
  breach_of_contract: [
    {
      id: "contract_terms",
      prompt: "What were the essential contract terms the defendant violated?",
      category: "facts",
      requiredForClaims: ["breach_of_contract"],
    },
    {
      id: "performance",
      prompt: "What did you perform, and what did the defendant fail to do?",
      category: "facts",
      requiredForClaims: ["breach_of_contract"],
    },
  ],
};

export function getIntakeQuestionsForClaims(claimTypes: string[]): IntakeQuestion[] {
  const byId = new Map<string, IntakeQuestion>();
  for (const q of BASE_QUESTIONS) {
    byId.set(q.id, q);
  }
  for (const type of claimTypes) {
    for (const q of CLAIM_SPECIFIC[type] ?? []) {
      byId.set(q.id, q);
    }
  }
  return [...byId.values()];
}

export function getDefendantIntakeQuestions(): IntakeQuestion[] {
  return [
    {
      id: "complaint_served",
      prompt: "When were you served with the complaint and in which court?",
      category: "procedure",
    },
    {
      id: "admissions_denials",
      prompt: "Which factual allegations do you admit, deny, or lack knowledge of?",
      category: "facts",
    },
    {
      id: "affirmative_defenses",
      prompt: "What affirmative defenses apply (statute of limitations, failure to state a claim, etc.)?",
      category: "procedure",
    },
    {
      id: "counterclaims",
      prompt: "Do you have counterclaims or cross-claims to assert?",
      category: "facts",
    },
  ];
}
