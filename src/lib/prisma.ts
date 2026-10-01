import { PrismaClient } from "@prisma/client";
import { getRuntimeDatabaseUrl } from "@/lib/prisma/database-url";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const url = getRuntimeDatabaseUrl();
  return new PrismaClient(
    url
      ? {
          datasources: {
            db: { url },
          },
        }
      : undefined,
  );
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
