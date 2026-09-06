-- Login rate-limiting — tracks failed attempts per phone number,
-- scoped separately for admin vs customer logins so one doesn't affect
-- the other. A row only exists while there are unresolved failures;
-- a successful login clears it entirely.

CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,

    identifier VARCHAR(100) NOT NULL,
    scope VARCHAR(20) NOT NULL,

    failed_count INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,

    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(identifier, scope)
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier_scope
ON login_attempts(identifier, scope);
