-- Module 7: Settings
-- Single-row table. The app only ever reads/updates the row where id = 1.

CREATE TABLE IF NOT EXISTS settings (
    id SMALLINT PRIMARY KEY DEFAULT 1,

    store_name VARCHAR(150) NOT NULL DEFAULT 'Bhakthi Bookshelf',

    contact_email VARCHAR(150),
    contact_phone VARCHAR(20),
    address TEXT,
    gst_number VARCHAR(20),

    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT settings_singleton CHECK (id = 1)
);

INSERT INTO settings (id, store_name)
VALUES (1, 'Bhakthi Bookshelf')
ON CONFLICT (id) DO NOTHING;
