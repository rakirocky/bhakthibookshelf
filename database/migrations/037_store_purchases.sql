-- In-app purchases made through an app store (Google Play Billing now,
-- Apple In-App Purchase later). One row per store purchase token; the
-- UNIQUE token is what makes granting idempotent — the app's verify call,
-- a restore on next launch and Google's real-time notification can all
-- arrive for the same purchase, and only the first one creates the
-- order/subscription. The order or subscription itself is a normal row
-- (payment_method = 'google_play'), so library access, invoices (036
-- trigger), emails, admin and reports all work unchanged.

CREATE TABLE IF NOT EXISTS store_purchases (
    id BIGSERIAL PRIMARY KEY,
    store VARCHAR(20) NOT NULL,                -- 'google_play' | 'app_store'
    purchase_token TEXT NOT NULL,
    product_id VARCHAR(100) NOT NULL,          -- book_<id> | plan_<id>
    store_order_id VARCHAR(100),               -- Google 'GPA.xxxx-…'
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    subscription_id BIGINT REFERENCES subscriptions(id) ON DELETE SET NULL,
    state VARCHAR(20) NOT NULL,                -- PURCHASED | PENDING | REFUNDED
    acknowledged_at TIMESTAMPTZ,
    voided_at TIMESTAMPTZ,
    raw JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (store, purchase_token)
);

CREATE INDEX IF NOT EXISTS store_purchases_customer_idx ON store_purchases (customer_id);
CREATE INDEX IF NOT EXISTS store_purchases_order_idx ON store_purchases (store_order_id);
