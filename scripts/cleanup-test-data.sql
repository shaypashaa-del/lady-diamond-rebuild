-- Removes the test data created while building the shop: every CANCELLED order
-- (they were all test orders; stock was already returned when they were
-- cancelled) and the test customers / test affiliates.
--
-- It does NOT touch products, categories, media, content, or the real account
-- (4314319@gmail.com, "שי פשה").
--
-- HOW TO RUN (Supabase → SQL Editor, or any Postgres client):
--   1. Take a backup first (Supabase → Database → Backups).
--   2. Run the whole file once as is: it shows what would be deleted and ends
--      with ROLLBACK, so nothing changes.
--   3. If the counts look right, change the last line ROLLBACK to COMMIT and run again.

-- Preview ---------------------------------------------------------------
SELECT 'orders to delete' AS what, count(*) FROM "Order" WHERE status = 'CANCELLED'
UNION ALL
SELECT 'test users to delete', count(*) FROM "User"
 WHERE lower(email) IN ('testuser@example.com','qa-customer-xyz-42@example.com','noa@example.com',
                        'noa-verify-flow@example.com','test-affiliate@example.com','maya-affiliate@example.com');

BEGIN;

-- 1. Orders (items and commissions cascade).
DELETE FROM "Order" WHERE status = 'CANCELLED';

-- 2. Coupons that belong to the test affiliates (their FK blocks deleting them).
DELETE FROM "Coupon" WHERE "affiliateId" IN (
  SELECT a.id FROM "Affiliate" a JOIN "User" u ON u.id = a."userId"
   WHERE lower(u.email) IN ('noa-verify-flow@example.com','test-affiliate@example.com','maya-affiliate@example.com'));

-- 3. Orders still pointing at those affiliates keep existing, just unattributed.
UPDATE "Order" SET "affiliateId" = NULL WHERE "affiliateId" IN (
  SELECT a.id FROM "Affiliate" a JOIN "User" u ON u.id = a."userId"
   WHERE lower(u.email) IN ('noa-verify-flow@example.com','test-affiliate@example.com','maya-affiliate@example.com'));

-- 4. Test users (affiliate profiles, clicks, payouts, addresses, tokens cascade).
DELETE FROM "User"
 WHERE lower(email) IN ('testuser@example.com','qa-customer-xyz-42@example.com','noa@example.com',
                        'noa-verify-flow@example.com','test-affiliate@example.com','maya-affiliate@example.com');

-- Result check
SELECT 'orders left' AS what, count(*) FROM "Order"
UNION ALL SELECT 'users left', count(*) FROM "User"
UNION ALL SELECT 'affiliates left', count(*) FROM "Affiliate";

ROLLBACK;  -- change to COMMIT; once the numbers above look right
