-- Self-serve OTP password reset. Separate from password_reset_requests
-- (the admin-assisted queue, kept as a manual fallback) — this table's
-- shape is fundamentally different: a hashed, expiring, single-use
-- secret rather than a to-do item for a human.

CREATE TABLE IF NOT EXISTS password_reset_otps (
    id SERIAL PRIMARY KEY,

    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_otps_customer_id
ON password_reset_otps(customer_id);
