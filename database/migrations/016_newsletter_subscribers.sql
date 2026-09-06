-- Newsletter subscribers — the homepage "Stay Connected" box has existed
-- since Module 1 but never actually saved anything. This is the table
-- it's finally wired up to.

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,

    email VARCHAR(150) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email
ON newsletter_subscribers(email);
