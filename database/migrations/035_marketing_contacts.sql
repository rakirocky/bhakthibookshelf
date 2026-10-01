-- Contacts for SMS / WhatsApp broadcasts (Admin → Contacts).
--
-- marketing_contacts holds numbers imported from the client's Excel/CSV
-- lists. Website/app users are NOT copied in: the admin list merges this
-- table with `customers` by phone, so a customer's number always stays in
-- step with their account (and disappears when they delete it).
--
-- Phones are stored like customers.phone: the 10-digit Indian mobile
-- number, no +91, no spaces.
--
-- consent: 'unknown' (imported, never asked), 'yes' (agreed to receive
-- messages), 'no' (opted out — never message again, whatever the source).

CREATE TABLE IF NOT EXISTS marketing_contact_imports (
    id                SERIAL PRIMARY KEY,
    filename          VARCHAR(255) NOT NULL,
    total_rows        INTEGER NOT NULL DEFAULT 0,
    added             INTEGER NOT NULL DEFAULT 0,
    updated           INTEGER NOT NULL DEFAULT 0,
    skipped_invalid   INTEGER NOT NULL DEFAULT 0,
    skipped_duplicate INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS marketing_contacts (
    id          SERIAL PRIMARY KEY,
    phone       VARCHAR(15)  NOT NULL UNIQUE,
    name        VARCHAR(150),
    language    VARCHAR(2) CHECK (language IN ('en', 'kn')),
    consent     VARCHAR(10)  NOT NULL DEFAULT 'unknown'
                CHECK (consent IN ('unknown', 'yes', 'no')),
    consent_at  TIMESTAMPTZ,
    import_id   INTEGER REFERENCES marketing_contact_imports(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Website/app users' own choice (NULL = not asked yet). Filled by the
-- opt-in checkbox at sign-up and the toggle in My Account.
ALTER TABLE customers ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS marketing_opt_in_at TIMESTAMPTZ;
