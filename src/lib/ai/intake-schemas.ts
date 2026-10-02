import {
  CLAIM_TEMPLATES,
  DAMAGE_CATEGORIES,
  isValidJurisdictionValue,
  type CaseCourtType,
} from "@/lib/legal/claim-templates";

const VALID_COURT_TYPES = new Set<CaseCourtType>([
  "FEDERAL",
  "STATE",
  "SMALL_CLAIMS",
]);

const VALID_CLAIM_TYPES = new Set(CLAIM_TEMPLATES.map((c) => c.type));

const VALID_FACT_CATEGORIES = new Set([
  "INCIDENT",
  "BACKGROUND",
  "DAMAGES",
  "PROCEDURAL",
  "WITNESS",
  "DOCUMENT",
  "OTHER",
]);

const VALID_DAMAGE_CATEGORIES = new Set(
  DAMAGE_CATEGORIES.map((d) => d.value),
);

export type CaseIntakeSuggestion = {
  title: string;
  courtType: CaseCourtType;
  jurisdiction: string;
  courtName: string;
  caseNumber: string;
  plaintiff: string;
  defendant: string;
  opposingParty: string;
  claimTypes: string[];
  notes: string;
};

export function normalizeCaseIntake(raw: unknown): CaseIntakeSuggestion {
  const data = (raw ?? {}) as Record<string, unknown>;
  const courtType = VALID_COURT_TYPES.has(data.courtType as CaseCourtType)
    ? (data.courtType as CaseCourtType)
    : "STATE";

  let jurisdiction =
    typeof data.jurisdiction === "string" ? data.jurisdiction.trim() : "";
  if (jurisdiction && !isValidJurisdictionValue(jurisdiction)) {
    jurisdiction = "";
  }

  const claimTypes = Array.isArray(data.claimTypes)
    ? data.claimTypes
        .filter((t): t is string => typeof t === "string")
        .filter((t) => VALID_CLAIM_TYPES.has(t))
    : [];

  const str = (key: string) =>
    typeof data[key] === "string" ? (data[key] as string).trim() : "";

  return {
    title: str("title"),
    courtType,
    jurisdiction,
    courtName: str("courtName"),
    caseNumber: str("caseNumber"),
    plaintiff: str("plaintiff"),
    defendant: str("defendant"),
    opposingParty: str("opposingParty") || str("defendant"),
    claimTypes,
    notes: str("notes"),
  };
}

export type FactsIntakeSuggestion = {
  facts: Array<{
    statement: string;
    date?: string;
    category: string;
    source?: string;
  }>;
  timeline: Array<{
    date: string;
    title: string;
    description?: string;
  }>;
  witnesses: Array<{
    name: string;
    contact?: string;
    statement?: string;
  }>;
  damages: Array<{
    category: string;
    amount: number;
    description?: string;
  }>;
  notes: string;
};

function parseOptionalDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function normalizeFactsIntake(raw: unknown): FactsIntakeSuggestion {
  const data = (raw ?? {}) as Record<string, unknown>;

  const facts = Array.isArray(data.facts)
    ? data.facts
        .map((item) => {
          const row = item as Record<string, unknown>;
          const statement =
            typeof row.statement === "string" ? row.statement.trim() : "";
          if (!statement) return null;
          const category =
            typeof row.category === "string" &&
            VALID_FACT_CATEGORIES.has(row.category)
              ? row.category
              : "OTHER";
          const date = parseOptionalDate(row.date);
          return {
            statement,
            category,
            ...(date ? { date: date.toISOString().split("T")[0] } : {}),
            ...(typeof row.source === "string" && row.source.trim()
              ? { source: row.source.trim() }
              : {}),
          };
        })
        .filter(Boolean)
    : [];

  const timeline = Array.isArray(data.timeline)
    ? data.timeline
        .map((item) => {
          const row = item as Record<string, unknown>;
          const title =
            typeof row.title === "string" ? row.title.trim() : "";
          const date = parseOptionalDate(row.date);
          if (!title || !date) return null;
          return {
            date: date.toISOString().split("T")[0],
            title,
            ...(typeof row.description === "string" && row.description.trim()
              ? { description: row.description.trim() }
              : {}),
          };
        })
        .filter(Boolean)
    : [];

  const witnesses = Array.isArray(data.witnesses)
    ? data.witnesses
        .map((item) => {
          const row = item as Record<string, unknown>;
          const name = typeof row.name === "string" ? row.name.trim() : "";
          if (!name) return null;
          return {
            name,
            ...(typeof row.contact === "string" && row.contact.trim()
              ? { contact: row.contact.trim() }
              : {}),
            ...(typeof row.statement === "string" && row.statement.trim()
              ? { statement: row.statement.trim() }
              : {}),
          };
        })
        .filter(Boolean)
    : [];

  const damages = Array.isArray(data.damages)
    ? data.damages
        .map((item) => {
          const row = item as Record<string, unknown>;
          const category =
            typeof row.category === "string" &&
            VALID_DAMAGE_CATEGORIES.has(row.category)
              ? row.category
              : "other";
          const amount =
            typeof row.amount === "number"
              ? row.amount
              : parseFloat(String(row.amount ?? 0));
          if (!Number.isFinite(amount) || amount <= 0) return null;
          return {
            category,
            amount,
            ...(typeof row.description === "string" && row.description.trim()
              ? { description: row.description.trim() }
              : {}),
          };
        })
        .filter(Boolean)
    : [];

  return {
    facts: facts as FactsIntakeSuggestion["facts"],
    timeline: timeline as FactsIntakeSuggestion["timeline"],
    witnesses: witnesses as FactsIntakeSuggestion["witnesses"],
    damages: damages as FactsIntakeSuggestion["damages"],
    notes: typeof data.notes === "string" ? data.notes.trim() : "",
  };
}
