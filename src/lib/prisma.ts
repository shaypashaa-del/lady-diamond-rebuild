import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// `max` caps connections per worker process — without it each of the ~9 parallel
// `next build` static-generation workers opens an unbounded pool, exhausting the
// local Postgres dev server's connection limit and causing random "server has
// closed the connection" prerender failures.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 3 });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
