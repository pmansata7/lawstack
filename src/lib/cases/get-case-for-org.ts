import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function getCaseForOrganization<
  TInclude extends Prisma.CaseInclude | undefined = undefined,
>(
  id: string,
  organizationId: string,
  include?: TInclude,
): Promise<
  | Prisma.CaseGetPayload<
      TInclude extends Prisma.CaseInclude
        ? { include: TInclude }
        : { include: undefined }
    >
  | null
> {
  return prisma.case.findFirst({
    where: { id, organizationId },
    include,
  }) as Promise<
    | Prisma.CaseGetPayload<
        TInclude extends Prisma.CaseInclude
          ? { include: TInclude }
          : { include: undefined }
      >
    | null
  >;
}
