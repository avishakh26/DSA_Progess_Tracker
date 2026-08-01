import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma";

// Prisma 7 connects through a driver adapter rather than a `url` in the schema.
// Swapping to Postgres later means replacing this adapter with
// `new PrismaPg({ connectionString: process.env.DATABASE_URL })` and flipping
// the provider in prisma/schema.prisma — nothing else changes.
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

// Reuse one client across hot reloads in dev, otherwise every reload opens a
// fresh connection to the SQLite file.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
