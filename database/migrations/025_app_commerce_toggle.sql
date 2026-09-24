-- Owner decision (2026-09-24): the Play Store app ships read-only (no
-- prices/buying — Play Billing policy), but the client may want in-app
-- buying later. This admin switch turns it on at runtime; the app loads
-- pages from the live site, so no app rebuild is needed. Off by default.

ALTER TABLE settings
ADD COLUMN IF NOT EXISTS app_commerce_enabled BOOLEAN NOT NULL DEFAULT FALSE;
