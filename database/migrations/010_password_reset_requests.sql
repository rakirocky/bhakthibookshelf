-- Password reset requests. Interim system until an email/SMS provider is
-- wired up for true self-service OTP/link-based reset. A customer submits
-- their phone number here; it shows up as a queue in the admin panel so
-- the admin can reset it without a phone call.

CREATE TABLE IF NOT EXISTS password_reset_requests (
    id SERIAL PRIMARY KEY,

    phone VARCHAR(15) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_password_reset_requests_status
ON password_reset_requests(status);
