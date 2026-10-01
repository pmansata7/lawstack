import { Prisma, type Case, type Claim } from "@prisma/client";
import type { CaseCourtType } from "@/lib/legal/claim-templates";
import {
  isPreparedStatementPoolerError,
  PGBOUNCER_DATABASE_HINT,
} from "@/lib/prisma/database-url";
import { prisma } from "@/lib/prisma";

export type CreateCaseClaimInput = {
  claimType: string;
  jurisdiction: string;
  elements: Prisma.InputJsonValue;
};

export type CreateCaseInput = {
  organizationId: string;
  title: string;
  courtType?: CaseCourtType;
  jurisdiction: string;
  courtName?: string | null;
  caseNumber?: string | null;
  plaintiff?: string | null;
  defendant?: string | null;
  opposingParty?: string | null;
  claims?: CreateCaseClaimInput[];
};

function emptyToNull(value: string | null | undefined) {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export async function createCaseWithClaims(
  input: CreateCaseInput,
): Promise<Case & { claims: Claim[] }> {
  const claimRows = input.claims ?? [];

  const created = await prisma.case.create({
    data: {
      organizationId: input.organizationId,
      title: input.title.trim(),
      courtType: input.courtType ?? "FEDERAL",
      jurisdiction: input.jurisdiction,
      courtName: emptyToNull(input.courtName),
      caseNumber: emptyToNull(input.caseNumber),
      plaintiff: emptyToNull(input.plaintiff),
      defendant: emptyToNull(input.defendant),
      opposingParty: emptyToNull(input.opposingParty),
      status: "SETUP",
    },
  });

  try {
    if (claimRows.length > 0) {
      await prisma.claim.createMany({
        data: claimRows.map((claim) => ({
          caseId: created.id,
          claimType: claim.claimType,
          jurisdiction: claim.jurisdiction,
          elements: claim.elements,
        })),
      });
    }
  } catch (error) {
    await prisma.case.delete({ where: { id: created.id } }).catch(() => {});
    throw error;
  }

  return prisma.case.findUniqueOrThrow({
    where: { id: created.id },
    include: { claims: true },
  });
}

export function getCreateCaseErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2003":
        return "Your organization could not be found. Try signing out and back in, or contact support.";
      case "P2021":
        return "The database schema is out of date. Run `npx prisma db push` on the deployed database.";
      case "P2002":
        return "A case with these details already exists.";
      default:
        break;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return "Invalid case data. Check court type, jurisdiction, and claims.";
  }

  if (error instanceof Error && error.message) {
    if (error.message.includes("row-level security")) {
      return "Database security policy blocked case creation. Verify DATABASE_URL uses the Supabase Postgres role.";
    }
    if (isPreparedStatementPoolerError(error)) {
      return PGBOUNCER_DATABASE_HINT;
    }
    return error.message;
  }

  return "Failed to create case";
}
