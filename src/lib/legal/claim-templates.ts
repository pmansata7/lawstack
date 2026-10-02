// ─── Legal Claim Element Templates ─────────────────────────────────
// Pre-built element structures for common claim types.
// Each claim type has the legal elements that must be pleaded and proven.

export interface ClaimElement {
  element: string;
  description: string;
}

export type CaseCourtType = "STATE" | "FEDERAL" | "SMALL_CLAIMS";

export interface ClaimTemplate {
  type: string;
  label: string;
  category: string;
  elements: ClaimElement[];
  description: string;
  /** When set, the template is only offered for these court types. */
  courtTypes?: CaseCourtType[];
}

export function getCourtTypeLabel(courtType: CaseCourtType): string {
  switch (courtType) {
    case "FEDERAL":
      return "Federal";
    case "STATE":
      return "State";
    case "SMALL_CLAIMS":
      return "Small Claims";
  }
}

export type JurisdictionOption = { value: string; label: string };

export function isSmallClaimsJurisdiction(jurisdiction: string): boolean {
  return JURISDICTIONS.smallClaims.some((j) => j.value === jurisdiction);
}

/** Court type used for claim templates and case creation (jurisdiction can imply small claims). */
export function resolveCourtType(
  courtType: CaseCourtType,
  jurisdiction: string,
): CaseCourtType {
  if (isSmallClaimsJurisdiction(jurisdiction)) return "SMALL_CLAIMS";
  return courtType;
}

export function getJurisdictionsForCourtType(
  courtType: CaseCourtType,
): JurisdictionOption[] {
  return getJurisdictionGroups(courtType).flatMap((group) => group.options);
}

export function getAllJurisdictionOptions(): JurisdictionOption[] {
  return [
    ...JURISDICTIONS.federal,
    ...JURISDICTIONS.state,
    ...JURISDICTIONS.smallClaims,
  ];
}

export function isValidJurisdictionValue(value: string): boolean {
  return getAllJurisdictionOptions().some((j) => j.value === value);
}

export function getJurisdictionGroups(
  courtType: CaseCourtType,
): { label: string; options: JurisdictionOption[] }[] {
  if (courtType === "FEDERAL") {
    return [{ label: "Federal districts", options: JURISDICTIONS.federal }];
  }
  if (courtType === "SMALL_CLAIMS") {
    return [
      { label: "Small claims courts", options: JURISDICTIONS.smallClaims },
    ];
  }
  return [
    { label: "Small claims courts", options: JURISDICTIONS.smallClaims },
    { label: "State courts", options: JURISDICTIONS.state },
  ];
}

const SMALL_CLAIMS_COMMON_TYPES = new Set([
  "breach_of_contract",
  "unjust_enrichment",
  "conversion",
  "fraud",
  "premises_liability",
  "nuisance",
]);

function sortClaimTemplatesForDisplay(
  templates: ClaimTemplate[],
  courtType: CaseCourtType,
): ClaimTemplate[] {
  return [...templates].sort((a, b) => {
    if (courtType === "SMALL_CLAIMS") {
      const rank = (t: ClaimTemplate) => (t.category === "Small Claims" ? 0 : 1);
      const byCategory = rank(a) - rank(b);
      if (byCategory !== 0) return byCategory;
    }
    return a.label.localeCompare(b.label);
  });
}

export function getClaimTemplatesForCourtType(
  courtType: CaseCourtType,
): ClaimTemplate[] {
  let templates: ClaimTemplate[];
  if (courtType === "SMALL_CLAIMS") {
    templates = CLAIM_TEMPLATES.filter(
      (template) =>
        template.courtTypes?.includes("SMALL_CLAIMS") ||
        SMALL_CLAIMS_COMMON_TYPES.has(template.type),
    );
  } else {
    templates = CLAIM_TEMPLATES.filter((template) => !template.courtTypes);
  }
  return sortClaimTemplatesForDisplay(templates, courtType);
}

export const CLAIM_TEMPLATES: ClaimTemplate[] = [
  {
    type: "negligence",
    label: "Negligence",
    category: "Tort",
    description: "Failure to exercise reasonable care causing harm to another.",
    elements: [
      { element: "Duty of Care", description: "Defendant owed plaintiff a duty of reasonable care." },
      { element: "Breach of Duty", description: "Defendant breached that duty by failing to exercise reasonable care." },
      { element: "Causation", description: "Defendant's breach was the actual and proximate cause of plaintiff's injury." },
      { element: "Damages", description: "Plaintiff suffered actual harm or loss as a result." },
    ],
  },
  {
    type: "negligent_infliction",
    label: "Negligent Infliction of Emotional Distress",
    category: "Tort",
    description: "Emotional distress caused by negligent conduct.",
    elements: [
      { element: "Duty", description: "Defendant owed a duty to avoid causing emotional distress." },
      { element: "Breach", description: "Defendant's negligent conduct breached that duty." },
      { element: "Causation", description: "Defendant's conduct caused plaintiff's emotional distress." },
      { element: "Severe Emotional Distress", description: "Plaintiff suffered severe emotional distress." },
    ],
  },
  {
    type: "intentional_infliction",
    label: "Intentional Infliction of Emotional Distress",
    category: "Tort",
    description: "Extreme and outrageous conduct causing severe emotional distress.",
    elements: [
      { element: "Extreme and Outrageous Conduct", description: "Defendant's conduct was extreme and outrageous." },
      { element: "Intent or Recklessness", description: "Defendant acted intentionally or recklessly." },
      { element: "Causation", description: "Defendant's conduct caused plaintiff's distress." },
      { element: "Severe Emotional Distress", description: "Plaintiff suffered severe emotional distress." },
    ],
  },
  {
    type: "battery",
    label: "Battery",
    category: "Tort",
    description: "Harmful or offensive contact with another person.",
    elements: [
      { element: "Harmful or Offensive Contact", description: "Defendant made harmful or offensive contact with plaintiff." },
      { element: "Intent", description: "Defendant intended to make contact or knew with substantial certainty it would occur." },
      { element: "Causation", description: "Defendant's contact caused plaintiff's harm." },
      { element: "Damages", description: "Plaintiff suffered damages as a result." },
    ],
  },
  {
    type: "assault",
    label: "Assault",
    category: "Tort",
    description: "Threat of imminent harmful or offensive contact.",
    elements: [
      { element: "Threatening Act", description: "Defendant committed an act that threatened imminent harmful or offensive contact." },
      { element: "Intent", description: "Defendant intended to cause apprehension of contact." },
      { element: "Apprehension", description: "Plaintiff reasonably apprehended imminent contact." },
      { element: "Damages", description: "Plaintiff suffered damages." },
    ],
  },
  {
    type: "false_imprisonment",
    label: "False Imprisonment",
    category: "Tort",
    description: "Intentional confinement of another without lawful authority.",
    elements: [
      { element: "Confinement", description: "Defendant confined plaintiff to a bounded area." },
      { element: "Intent", description: "Defendant intended to confine plaintiff." },
      { element: "Awareness or Harm", description: "Plaintiff was aware of or harmed by the confinement." },
      { element: "No Lawful Authority", description: "Defendant had no lawful authority to confine plaintiff." },
    ],
  },
  {
    type: "defamation",
    label: "Defamation",
    category: "Tort",
    description: "False statement of fact that injures reputation.",
    elements: [
      { element: "False Statement", description: "Defendant made a false statement of fact." },
      { element: "Publication", description: "The statement was communicated to a third party." },
      { element: "Fault", description: "Defendant acted with at least negligence regarding the statement's truth." },
      { element: "Harm to Reputation", description: "The statement caused harm to plaintiff's reputation." },
    ],
  },
  {
    type: "fraud",
    label: "Fraud / Fraudulent Misrepresentation",
    category: "Tort",
    description: "Intentional misrepresentation causing reliance and harm.",
    elements: [
      { element: "Misrepresentation", description: "Defendant made a false representation of material fact." },
      { element: "Knowledge of Falsity", description: "Defendant knew the representation was false or made it recklessly." },
      { element: "Intent to Induce Reliance", description: "Defendant intended plaintiff to rely on the representation." },
      { element: "Justifiable Reliance", description: "Plaintiff justifiably relied on the representation." },
      { element: "Damages", description: "Plaintiff suffered damages as a result." },
    ],
  },
  {
    type: "breach_of_contract",
    label: "Breach of Contract",
    category: "Contract",
    description: "Failure to perform obligations under a valid contract.",
    elements: [
      { element: "Valid Contract", description: "A valid contract existed between the parties." },
      { element: "Performance by Plaintiff", description: "Plaintiff performed or was excused from performance." },
      { element: "Breach", description: "Defendant breached the contract by failing to perform." },
      { element: "Damages", description: "Plaintiff suffered damages as a result of the breach." },
    ],
  },
  {
    type: "product_liability",
    label: "Product Liability (Strict Liability)",
    category: "Tort",
    description: "Liability for defective products causing harm.",
    elements: [
      { element: "Defective Product", description: "The product was defective in design, manufacture, or warning." },
      { element: "Injury", description: "Plaintiff suffered injury while using the product as intended or foreseeably." },
      { element: "Causation", description: "The defect caused plaintiff's injury." },
      { element: "In Stream of Commerce", description: "The product was in the stream of commerce when sold." },
    ],
  },
  {
    type: "premises_liability",
    label: "Premises Liability",
    category: "Tort",
    description: "Liability for injuries caused by dangerous conditions on property.",
    elements: [
      { element: "Duty", description: "Defendant owed plaintiff a duty of care as possessor/owner of the property." },
      { element: "Dangerous Condition", description: "A dangerous condition existed on the property." },
      { element: "Knowledge", description: "Defendant knew or should have known of the dangerous condition." },
      { element: "Causation", description: "The dangerous condition caused plaintiff's injury." },
      { element: "Damages", description: "Plaintiff suffered damages." },
    ],
  },
  {
    type: "conversion",
    label: "Conversion",
    category: "Tort",
    description: "Wrongful exercise of dominion over another's property.",
    elements: [
      { element: "Property Interest", description: "Plaintiff had a property interest in the chattel." },
      { element: "Wrongful Acts", description: "Defendant intentionally exercised dominion or control over the chattel." },
      { element: "Interference", description: "Defendant's acts interfered with plaintiff's rights in the chattel." },
      { element: "Damages", description: "Plaintiff suffered damages." },
    ],
  },
  {
    type: "trespass",
    label: "Trespass to Land",
    category: "Tort",
    description: "Intentional entry onto land owned by another.",
    elements: [
      { element: "Possession", description: "Plaintiff was in lawful possession of the land." },
      { element: "Entry", description: "Defendant intentionally entered or remained on the land." },
      { element: "Without Consent", description: "Defendant entered without plaintiff's consent." },
      { element: "Damages", description: "Plaintiff suffered damages." },
    ],
  },
  {
    type: "nuisance",
    label: "Nuisance",
    category: "Tort",
    description: "Unreasonable interference with use and enjoyment of property.",
    elements: [
      { element: "Interference", description: "Defendant's conduct interfered with plaintiff's use and enjoyment of property." },
      { element: "Unreasonable", description: "The interference was unreasonable." },
      { element: "Causation", description: "Defendant's conduct caused the interference." },
      { element: "Damages", description: "Plaintiff suffered damages." },
    ],
  },
  {
    type: "unjust_enrichment",
    label: "Unjust Enrichment / Restitution",
    category: "Quasi-Contract",
    description: "Recovery of benefits conferred without legal basis.",
    elements: [
      { element: "Benefit Conferred", description: "Plaintiff conferred a benefit on defendant." },
      { element: "Defendant's Knowledge", description: "Defendant was aware of or accepted the benefit." },
      { element: "Unjust Retention", description: "It would be unjust for defendant to retain the benefit without payment." },
    ],
  },
  {
    type: "negligent_hiring",
    label: "Negligent Hiring / Supervision / Retention",
    category: "Tort",
    description: "Liability for harm caused by improperly vetted employees.",
    elements: [
      { element: "Incompetent Employee", description: "Defendant hired or retained an incompetent or dangerous employee." },
      { element: "Knowledge or Should Have Known", description: "Defendant knew or should have known of the employee's incompetence." },
      { element: "Foreseeable Harm", description: "The harm was a foreseeable consequence of the employee's incompetence." },
      { element: "Causation", description: "The employee's conduct caused plaintiff's injury." },
      { element: "Damages", description: "Plaintiff suffered damages." },
    ],
  },
  {
    type: "money_owed",
    label: "Money Owed / Unpaid Debt",
    category: "Small Claims",
    description: "Recovery of money lent, unpaid invoices, or other sums due.",
    courtTypes: ["SMALL_CLAIMS"],
    elements: [
      { element: "Agreement or Loan", description: "Defendant agreed to pay or borrowed money from plaintiff." },
      { element: "Performance or Delivery", description: "Plaintiff provided goods, services, or funds as agreed." },
      { element: "Amount Due", description: "A specific sum remains unpaid." },
      { element: "Demand", description: "Plaintiff demanded payment and defendant failed to pay." },
    ],
  },
  {
    type: "security_deposit",
    label: "Security Deposit Dispute",
    category: "Small Claims",
    description: "Wrongful withholding of a residential security deposit.",
    courtTypes: ["SMALL_CLAIMS"],
    elements: [
      { element: "Tenancy", description: "Plaintiff was a tenant and defendant was the landlord." },
      { element: "Deposit Paid", description: "Plaintiff paid a security deposit." },
      { element: "Lawful Termination", description: "The tenancy ended and plaintiff vacated in compliance with the lease." },
      { element: "Wrongful Withholding", description: "Defendant withheld deposit amounts without lawful deductions." },
      { element: "Damages", description: "Plaintiff is entitled to the wrongfully withheld amount (and statutory penalties if applicable)." },
    ],
  },
  {
    type: "defective_goods_services",
    label: "Defective Goods or Services",
    category: "Small Claims",
    description: "Failure to deliver goods or services as promised.",
    courtTypes: ["SMALL_CLAIMS"],
    elements: [
      { element: "Agreement", description: "Parties agreed plaintiff would pay for specific goods or services." },
      { element: "Payment or Consideration", description: "Plaintiff paid or provided consideration." },
      { element: "Defect or Non-Performance", description: "Goods were defective or services were not performed as promised." },
      { element: "Notice", description: "Plaintiff notified defendant of the problem." },
      { element: "Damages", description: "Plaintiff suffered financial loss." },
    ],
  },
  {
    type: "vehicle_property_damage",
    label: "Vehicle or Property Damage",
    category: "Small Claims",
    description: "Property damage from accidents, negligence, or intentional acts.",
    courtTypes: ["SMALL_CLAIMS"],
    elements: [
      { element: "Ownership", description: "Plaintiff owned or had an interest in the damaged property." },
      { element: "Defendant's Conduct", description: "Defendant damaged the property through negligence or wrongful acts." },
      { element: "Causation", description: "Defendant's conduct caused the damage." },
      { element: "Repair or Value", description: "Plaintiff incurred repair costs or lost property value." },
    ],
  },
  {
    type: "landlord_tenant",
    label: "Landlord-Tenant Dispute (Rent / Repairs)",
    category: "Small Claims",
    description: "Disputes over rent, habitability, or repair obligations.",
    courtTypes: ["SMALL_CLAIMS"],
    elements: [
      { element: "Landlord-Tenant Relationship", description: "A landlord-tenant relationship existed." },
      { element: "Obligation", description: "Defendant failed a rent, repair, or habitability obligation." },
      { element: "Notice", description: "Plaintiff gave reasonable notice where required." },
      { element: "Damages", description: "Plaintiff suffered financial harm (e.g., unpaid rent, repair costs, or rent abatement)." },
    ],
  },
  {
    type: "small_claims_negligence",
    label: "Personal Injury (Small Claims)",
    category: "Small Claims",
    description: "Minor injuries and medical expenses within small claims limits.",
    courtTypes: ["SMALL_CLAIMS"],
    elements: [
      { element: "Duty of Care", description: "Defendant owed plaintiff a duty of reasonable care." },
      { element: "Breach", description: "Defendant failed to exercise reasonable care." },
      { element: "Causation", description: "Defendant's conduct caused plaintiff's injury." },
      { element: "Damages", description: "Plaintiff suffered medical bills or other compensable harm within jurisdictional limits." },
    ],
  },
];

export function getClaimLabel(claimType: string): string {
  return (
    CLAIM_TEMPLATES.find((template) => template.type === claimType)?.label ??
    claimType
  );
}

export const JURISDICTIONS = {
  federal: [
    { value: "federal-northern-district-ca", label: "Northern District of California" },
    { value: "federal-central-district-ca", label: "Central District of California" },
    { value: "federal-southern-district-ny", label: "Southern District of New York" },
    { value: "federal-eastern-district-ny", label: "Eastern District of New York" },
    { value: "federal-northern-district-il", label: "Northern District of Illinois" },
    { value: "federal-district-ma", label: "District of Massachusetts" },
    { value: "federal-western-district-tx", label: "Western District of Texas" },
    { value: "federal-southern-district-tx", label: "Southern District of Texas" },
    { value: "federal-district-nv", label: "District of Nevada" },
    { value: "federal-district-az", label: "District of Arizona" },
    { value: "federal-district-wa", label: "Western District of Washington" },
    { value: "federal-district-or", label: "District of Oregon" },
    { value: "federal-district-co", label: "District of Colorado" },
    { value: "federal-district-fl-s", label: "Southern District of Florida" },
    { value: "federal-district-fl-m", label: "Middle District of Florida" },
    { value: "federal-district-ga-n", label: "Northern District of Georgia" },
  ],
  state: [
    { value: "ca-superior", label: "California Superior Court" },
    { value: "ny-supreme", label: "New York Supreme Court" },
    { value: "il-circuit", label: "Illinois Circuit Court" },
    { value: "tx-district", label: "Texas District Court" },
    { value: "ma-superior", label: "Massachusetts Superior Court" },
    { value: "nv-district", label: "Nevada District Court" },
    { value: "az-superior", label: "Arizona Superior Court" },
    { value: "wa-superior", label: "Washington Superior Court" },
    { value: "or-circuit", label: "Oregon Circuit Court" },
    { value: "co-district", label: "Colorado District Court" },
    { value: "fl-circuit", label: "Florida Circuit Court" },
    { value: "ga-superior", label: "Georgia Superior Court" },
  ],
  smallClaims: [
    { value: "ca-small-claims", label: "California Small Claims Court" },
    { value: "ny-small-claims", label: "New York City Civil Court (Small Claims)" },
    { value: "il-small-claims", label: "Illinois Small Claims Court" },
    { value: "tx-small-claims", label: "Texas Justice Court (Small Claims)" },
    { value: "ma-small-claims", label: "Massachusetts Small Claims Court" },
    { value: "nv-small-claims", label: "Nevada Small Claims Court" },
    { value: "az-small-claims", label: "Arizona Small Claims Court" },
    { value: "wa-small-claims", label: "Washington Small Claims Court" },
    { value: "or-small-claims", label: "Oregon Small Claims Court" },
    { value: "co-small-claims", label: "Colorado County Court (Small Claims)" },
    { value: "fl-small-claims", label: "Florida County Court (Small Claims)" },
    { value: "ga-small-claims", label: "Georgia Magistrate Court (Small Claims)" },
  ],
};

export const DAMAGE_CATEGORIES = [
  { value: "medical", label: "Medical Expenses" },
  { value: "lost_wages", label: "Lost Wages / Income" },
  { value: "future_medical", label: "Future Medical Expenses" },
  { value: "future_lost_wages", label: "Future Lost Earning Capacity" },
  { value: "property", label: "Property Damage" },
  { value: "pain_suffering", label: "Pain and Suffering" },
  { value: "emotional_distress", label: "Emotional Distress" },
  { value: "loss_of_consortium", label: "Loss of Consortium" },
  { value: "punitive", label: "Punitive Damages" },
  { value: "legal_fees", label: "Legal Fees / Costs" },
  { value: "other", label: "Other" },
];
