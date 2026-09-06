-- Site-wide announcements — shown as a flash bar at the top of every
-- public page (upcoming books, offers, festival greetings, etc).
-- Multiple can be active at once; the bar rotates through them.

CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,

    message TEXT NOT NULL,
    link VARCHAR(255),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_is_active
ON announcements(is_active);
