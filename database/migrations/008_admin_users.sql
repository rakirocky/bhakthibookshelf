-- Module: Admin authentication
-- Login is by phone number + password. Only phone numbers present (and
-- active) in this table can log in. Adding a new admin later = adding a
-- new row here (via scripts/seed-admin.js) — no code changes needed.

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,

    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    password_hash TEXT NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_users_phone
ON admin_users(phone);

-- No rows are seeded here on purpose — passwords must be hashed with
-- bcrypt, which needs the bcryptjs package (Node runtime), not raw SQL.
-- Run `node scripts/seed-admin.js` after `npm install` to create the two
-- initial admin accounts (8660388171 and 8050682021) with passwords you
-- choose interactively.
