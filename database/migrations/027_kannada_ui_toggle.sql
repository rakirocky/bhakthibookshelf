-- Owner decision (2026-09-25, option A): the navbar ಕನ್ನಡ choice should
-- only FILTER books by default; translating the website interface into
-- Kannada is a separate admin switch, OFF unless the client asks for it.

ALTER TABLE settings
ADD COLUMN IF NOT EXISTS kannada_ui_enabled BOOLEAN NOT NULL DEFAULT FALSE;
