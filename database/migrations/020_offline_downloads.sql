-- Offline downloads for the mobile app. See docs/downloads-drm-design.md.
--
-- A download is tied to a triple: account + book + device. The book file
-- is encrypted on the device and readable only in the in-app reader; the
-- rows here are the server's record of what each device is entitled to
-- hold, so a re-install can restore without paying again and so "Manage
-- devices" has something to list.
--
-- Deliberately NO expiry / re-validation columns: once a book is
-- downloaded it stays on that device permanently, even if a subscription
-- later lapses. Deauthorizing a device frees a slot for future downloads
-- but does not reach back and disable copies already on it.

CREATE TABLE IF NOT EXISTS customer_devices (
    id SERIAL PRIMARY KEY,

    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

    -- Random UUID the app generates on first launch and keeps in the
    -- platform keystore. Not derived from any hardware identifier.
    device_id VARCHAR(64) NOT NULL,

    platform VARCHAR(16) NOT NULL DEFAULT 'android',
    label VARCHAR(120),

    first_seen TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Set when the customer removes the device from "Manage devices".
    -- Blocks new downloads; existing local copies are untouched.
    revoked_at TIMESTAMPTZ,

    UNIQUE (customer_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_devices_customer_id
ON customer_devices(customer_id);

CREATE TABLE IF NOT EXISTS book_downloads (
    id SERIAL PRIMARY KEY,

    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    customer_device_id INTEGER NOT NULL
        REFERENCES customer_devices(id) ON DELETE CASCADE,

    licensed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Set if the customer deletes the download from the app, or an admin
    -- pulls it after a refund. The app treats a revoked row as "not
    -- licensed" on its next reconcile.
    revoked_at TIMESTAMPTZ,

    UNIQUE (customer_device_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_book_downloads_customer_id
ON book_downloads(customer_id);

CREATE INDEX IF NOT EXISTS idx_book_downloads_device
ON book_downloads(customer_device_id);
