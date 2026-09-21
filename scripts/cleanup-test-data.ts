// Dev/QA-generated data cleanup — run manually, never automatically.
//
// Every order in the local dev database and most of its user accounts are
// synthetic test data created by manual and automated QA during this
// project's development (emails like `price-tamper-test@example.com`,
// `stock-test@example.com`, `commission-regress@example.com`). None of it
// is a real customer. This script removes that test data so the database
// starts clean before the site is ever connected to a real domain.
//
// It does NOT touch: products, categories, tags, pages, content blocks, or
// the real admin accounts (diana@ladydiamondjewels.com, shayp@codevalue.com).
//
// Review the KEEP lists below before running — add any email/coupon code
// you want preserved. Then run with:
//   npx tsx scripts/cleanup-test-data.ts          (dry run — just prints)
//   npx tsx scripts/cleanup-test-data.ts --apply   (actually deletes)

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Real accounts to always keep, regardless of anything else below.
const KEEP_USER_EMAILS = new Set([
  "diana@ladydiamondjewels.com",
  "shayp@codevalue.com",
]);

const APPLY = process.argv.includes("--apply");

async function main() {
  const orders = await prisma.order.findMany({ select: { id: true, orderNumber: true, email: true } });
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  const coupons = await prisma.coupon.findMany({ where: { code: { startsWith: "TEST" } }, select: { id: true, code: true } });
  const testMessages = await prisma.contactMessage.findMany({
    where: { OR: [{ subject: { contains: "Test", mode: "insensitive" } }, { email: { contains: "test@example.com" } }] },
    select: { id: true, email: true, subject: true },
  });

  const usersToDelete = users.filter((u) => !KEEP_USER_EMAILS.has(u.email));

  console.log(`Orders to delete: ${orders.length}`);
  orders.forEach((o) => console.log("  -", o.orderNumber, o.email));

  console.log(`\nUsers to delete: ${usersToDelete.length} (keeping ${users.length - usersToDelete.length} real admin account(s))`);
  usersToDelete.forEach((u) => console.log("  -", u.email, `(${u.role})`));

  console.log(`\nTest coupons to delete: ${coupons.length}`);
  coupons.forEach((c) => console.log("  -", c.code));

  console.log(`\nTest contact messages to delete: ${testMessages.length}`);
  testMessages.forEach((m) => console.log("  -", m.email, m.subject));

  if (!APPLY) {
    console.log("\nDry run only — nothing deleted. Re-run with --apply to actually delete the above.");
    return;
  }

  await prisma.$transaction([
    prisma.orderItem.deleteMany({ where: { orderId: { in: orders.map((o) => o.id) } } }),
    prisma.order.deleteMany({ where: { id: { in: orders.map((o) => o.id) } } }),
    prisma.contactMessage.deleteMany({ where: { id: { in: testMessages.map((m) => m.id) } } }),
    prisma.coupon.deleteMany({ where: { id: { in: coupons.map((c) => c.id) } } }),
    prisma.user.deleteMany({ where: { id: { in: usersToDelete.map((u) => u.id) } } }),
  ]);
  console.log("\nDone — test data removed.");
}

main().finally(() => prisma.$disconnect());
