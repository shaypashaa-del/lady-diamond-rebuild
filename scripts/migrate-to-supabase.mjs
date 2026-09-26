import { Client } from "pg";
import "dotenv/config";

const SOURCE_URL = process.env.SOURCE_DATABASE_URL;
const TARGET_URL = process.env.TARGET_DATABASE_URL;

const TABLES = [
  "User",
  "PasswordResetToken",
  "Address",
  "CustomerNote",
  "Category",
  "Tag",
  "MediaAsset",
  "Product",
  "ProductCategory",
  "ProductTag",
  "ProductRelation",
  "ProductImage",
  "ProductVariant",
  "ContentBlock",
  "Page",
  "ContactMessage",
  "NewsletterSubscriber",
  "Setting",
  "Order",
  "OrderItem",
  "Coupon",
  "ShippingRule",
  "Affiliate",
  "AffiliateTierRule",
  "AffiliateClick",
  "Commission",
  "Payout",
];

async function main() {
  const src = new Client({ connectionString: SOURCE_URL });
  const dst = new Client({ connectionString: TARGET_URL });
  await src.connect();
  await dst.connect();

  await dst.query("SET session_replication_role = replica;");

  for (const table of TABLES) {
    const { rows } = await src.query(`SELECT * FROM "${table}"`);
    if (rows.length === 0) {
      console.log(`${table}: 0 rows, skipping`);
      continue;
    }
    const columns = Object.keys(rows[0]);
    const colList = columns.map((c) => `"${c}"`).join(", ");
    let inserted = 0;
    for (const row of rows) {
      const values = columns.map((c) => row[c]);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
      const sql = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
      try {
        await dst.query(sql, values);
        inserted++;
      } catch (err) {
        console.error(`  ${table} row failed:`, err.message);
      }
    }
    console.log(`${table}: ${inserted}/${rows.length} rows copied`);
  }

  await dst.query("SET session_replication_role = DEFAULT;");

  await src.end();
  await dst.end();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
