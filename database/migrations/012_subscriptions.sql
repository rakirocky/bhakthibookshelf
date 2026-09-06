-- Subscriptions. Manual-payment flow for now (same pattern as Orders):
-- customer subscribes -> row created as PENDING -> admin confirms
-- payment received (bank transfer/UPI, outside the app) -> marks PAID ->
-- starts_at/ends_at get set at that moment, not at signup time.
--
-- Promoter attribution reuses the exact same cookie mechanism as Orders,
-- so a promoter gets credit whether they brought in a book sale or a
-- subscriber.

CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO subscription_plans (name, price, duration_days)
SELECT 'Yearly Access', 999.00, 365
WHERE NOT EXISTS (
    SELECT 1 FROM subscription_plans WHERE name = 'Yearly Access'
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,

    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    promoter_id INTEGER REFERENCES promoters(id) ON DELETE SET NULL,

    amount NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id
ON subscriptions(customer_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_status
ON subscriptions(payment_status);
