-- Self-service account deletion (App Store guideline 5.1.1(v), Google
-- Play account-deletion policy). Deleting an account anonymises the
-- customers row instead of removing it: orders and subscriptions must be
-- kept for GST records (invoices, 72 months) and still reference it.
-- The phone number is freed (replaced by "del-<id>") so the person can
-- sign up again later with a brand-new account.
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
