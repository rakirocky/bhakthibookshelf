-- Owner decision (2026-09-19): the single ₹999 subscription plan
-- becomes a one-time lifetime purchase instead of a yearly renewal —
-- pay once, permanent access to every book, including ones uploaded
-- after the purchase (access is checked live per book, never against a
-- fixed list — see AccessService.customerHasAccessToBook — so this
-- needed no separate "future books" wiring). NULL duration_days /
-- ends_at means "never expires" everywhere those columns are read.

ALTER TABLE subscription_plans
ALTER COLUMN duration_days DROP NOT NULL;

UPDATE subscription_plans
SET name = 'Lifetime Access', duration_days = NULL
WHERE name = 'Yearly Access';

-- Any already-PAID subscription under this plan becomes lifetime too —
-- there's one canonical plan here, not a legacy yearly tier sitting
-- alongside a new lifetime one. A no-op today (no real subscribers
-- yet, confirmed 2026-09-19), but correct if this ever runs after real
-- ones exist.
UPDATE subscriptions s
SET ends_at = NULL
FROM subscription_plans p
WHERE s.plan_id = p.id
  AND p.name = 'Lifetime Access'
  AND s.payment_status = 'PAID';
