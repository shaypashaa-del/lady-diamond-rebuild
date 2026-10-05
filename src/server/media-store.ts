import "server-only";
import { prisma } from "@/lib/prisma";

// Uploaded photos live in the database, not on the web server's disk. The
// production host rebuilds the app on every deploy and serves `public/` from a
// snapshot, so files written to public/uploads at runtime were not served
// (404) and were lost on redeploy. Rows here survive both. The table is
// created on first use, so no manual migration step is needed.
let ready: Promise<void> | null = null;

function ensureTable() {
  ready ??= prisma
    .$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "MediaBlob" (
         "id" TEXT PRIMARY KEY,
         "contentType" TEXT NOT NULL,
         "data" BYTEA NOT NULL,
         "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
       )`
    )
    .then(() => undefined)
    .catch((err) => {
      ready = null;
      throw err;
    });
  return ready;
}

export async function saveMediaBlob(id: string, contentType: string, data: Buffer) {
  await ensureTable();
  await prisma.$executeRaw`INSERT INTO "MediaBlob" ("id", "contentType", "data") VALUES (${id}, ${contentType}, ${data})`;
}

export async function getMediaBlob(id: string) {
  await ensureTable();
  const rows = await prisma.$queryRaw<{ contentType: string; data: Buffer }[]>`
    SELECT "contentType", "data" FROM "MediaBlob" WHERE "id" = ${id} LIMIT 1`;
  return rows[0] ?? null;
}

export async function deleteMediaBlob(id: string) {
  await ensureTable();
  await prisma.$executeRaw`DELETE FROM "MediaBlob" WHERE "id" = ${id}`;
}
