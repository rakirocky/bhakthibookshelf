-- Migration ledger. Until now migrations were applied by hand and there
-- was no record of which had run — which is how 016_newsletter_subscribers
-- ended up missing on a database while the code assumed it was there.
--
-- `scripts/migrate.mjs` creates this table (idempotently, same as here),
-- then runs every file in database/migrations/ that isn't listed in it,
-- in filename order, each in its own transaction, recording the filename
-- on success. Every migration in this folder is written to be safe to
-- re-run (IF NOT EXISTS / ON CONFLICT / WHERE NOT EXISTS), so a first run
-- against an already-migrated database just records the backlog.

CREATE TABLE IF NOT EXISTS schema_migrations (
    filename    TEXT PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
