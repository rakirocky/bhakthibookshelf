-- Customer accounts. Separate from admin_users on purpose: customers
-- self-register, admins are provisioned only via scripts/seed-admin.js.
-- Keeping them in separate tables means a bug in one login system can
-- never accidentally grant access to the other.

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,

    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(150),
    email VARCHAR(150),
    password_hash TEXT NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_phone
ON customers(phone);
