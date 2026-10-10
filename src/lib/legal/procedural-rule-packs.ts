export type ProceduralRuleItem = {
  id: string;
  requirement: string;
  citation?: string;
  category: "filing" | "service" | "format" | "local" | "small_claims";
};

export type ProceduralRulePack = {
  jurisdiction: string;
  label: string;
  items: ProceduralRuleItem[];
};

export const PROCEDURAL_RULE_PACKS: ProceduralRulePack[] = [
  {
    jurisdiction: "ca-small-claims",
    label: "California Small Claims",
    items: [
      {
        id: "sc_limit",
        requirement: "Confirm claim amount is within small claims jurisdictional limit.",
        citation: "Cal. Code Civ. Proc. § 116.221",
        category: "filing",
      },
      {
        id: "sc_demand",
        requirement: "Document demand letter or pre-filing outreach when applicable.",
        category: "service",
      },
      {
        id: "sc_form",
        requirement: "Use court-approved small claims filing form for the county.",
        category: "format",
      },
      {
        id: "sc_fee_waiver",
        requirement: "Evaluate fee waiver (FW-001) if client qualifies.",
        category: "filing",
      },
    ],
  },
  {
    jurisdiction: "federal-northern-district-ca",
    label: "N.D. California (federal)",
    items: [
      {
        id: "frcp_8",
        requirement: "Factual allegations must satisfy Twombly/Iqbal plausibility.",
        citation: "Fed. R. Civ. P. 8(a)",
        category: "format",
      },
      {
        id: "frcp_11",
        requirement: "Attorney signature certifies good-faith factual and legal basis.",
        citation: "Fed. R. Civ. P. 11",
        category: "filing",
      },
      {
        id: "nd_civ_l_rules",
        requirement: "Check N.D. Cal. Civil Local Rules for page limits and meet-and-confer.",
        category: "local",
      },
      {
        id: "jurisdiction_para",
        requirement: "Include subject-matter and personal jurisdiction factual predicates.",
        category: "filing",
      },
    ],
  },
  {
    jurisdiction: "ca-state",
    label: "California Superior Court (state)",
    items: [
      {
        id: "ccp_430_10",
        requirement: "Verify venue and party capacity for state court.",
        citation: "Cal. Code Civ. Proc.",
        category: "filing",
      },
      {
        id: "cm_010",
        requirement: "Prepare case management statement timeline after answer.",
        citation: "Jud. Council Form CM-110",
        category: "local",
      },
    ],
  },
];

export function getProceduralRulePack(jurisdiction: string): ProceduralRulePack | null {
  const exact = PROCEDURAL_RULE_PACKS.find((p) => p.jurisdiction === jurisdiction);
  if (exact) return exact;
  if (jurisdiction.includes("small-claims")) {
    return PROCEDURAL_RULE_PACKS.find((p) => p.jurisdiction === "ca-small-claims") ?? null;
  }
  if (jurisdiction.startsWith("federal")) {
    return PROCEDURAL_RULE_PACKS.find(
      (p) => p.jurisdiction === "federal-northern-district-ca",
    ) ?? null;
  }
  return PROCEDURAL_RULE_PACKS.find((p) => p.jurisdiction === "ca-state") ?? null;
}

export function mergeProceduralChecklist(
  aiChecklist: Array<{ requirement: string; met: boolean; notes?: string }>,
  pack: ProceduralRulePack | null,
) {
  if (!pack) return aiChecklist;
  const existing = new Set(aiChecklist.map((c) => c.requirement.toLowerCase()));
  const merged = [...aiChecklist];
  for (const item of pack.items) {
    if (!existing.has(item.requirement.toLowerCase())) {
      merged.push({
        requirement: item.requirement,
        met: false,
        notes: item.citation ? `Pack: ${item.citation}` : "From procedural rule pack",
      });
    }
  }
  return merged;
}
