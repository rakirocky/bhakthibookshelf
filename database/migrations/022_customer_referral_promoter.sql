-- Durable, account-level promoter attribution. Until now the only link
-- between a purchase and a promoter was the `promoter_ref` cookie set by
-- proxy.ts when someone visits ?ref=CODE — it expires in 30 days and only
-- covers purchases made in that same browser. This adds a permanent,
-- first-touch binding on the customer record itself: entering a referral
-- code at signup or login attributes the account to that promoter once,
-- and every future purchase by that account is attributed regardless of
-- cookies, device, or how much later the purchase happens.

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS referred_by_promoter_id INTEGER
REFERENCES promoters(id)
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_customers_referred_by_promoter_id
ON customers(referred_by_promoter_id);
