-- Promoter / affiliate tracking. Admin-only visibility (no promoter
-- login) — you check everyone's numbers from /admin/promoters.
-- Referral links work as yoursite.com/?ref=CODE on any page; the code is
-- captured into a cookie by middleware and attached to whichever order
-- the visitor eventually places, if any.

CREATE TABLE IF NOT EXISTS promoters (
    id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,

    contact_phone VARCHAR(20),
    contact_email VARCHAR(150),

    commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_promoters_code
ON promoters(code);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS promoter_id INTEGER
REFERENCES promoters(id)
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_promoter_id
ON orders(promoter_id);
