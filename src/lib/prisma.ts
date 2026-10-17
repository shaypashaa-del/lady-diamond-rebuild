import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// `max` caps connections per worker process — without it each of the ~9 parallel
// `next build` static-generation workers opens an unbounded pool, exhausting the
// local Postgres dev server's connection limit and causing random "server has
// closed the connection" prerender failures.
//
// At runtime in production the opposite problem matters: with only 3 connections
// and the default 10 s idle timeout, a page that runs several queries queues behind
// them and, after any quiet moment, pays a fresh TLS + auth handshake to the remote
// database (seconds) on the first request. So at runtime we keep more connections,
// keep them open for minutes, and ping them (see below) so visitors hit a warm pool.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";
const isRuntimeProd = process.env.NODE_ENV === "production" && !isBuild;
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: isRuntimeProd ? 10 : 3,
  ...(isRuntimeProd ? { idleTimeoutMillis: 10 * 60_000, connectionTimeoutMillis: 15_000, keepAlive: true } : {}),
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Keep a few connections warm in production (a tiny query every 20 s).
if (isRuntimeProd && !globalForPrisma.prisma) {
  const keepWarm = () => void Promise.all([1, 2, 3].map(() => prisma.$queryRaw`SELECT 1`)).catch(() => undefined);
  keepWarm();
  setInterval(keepWarm, 20_000).unref();
  globalForPrisma.prisma = prisma;
}
