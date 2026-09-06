-- Contact form submissions. A real inbox for the "Contact Us" page,
-- since it previously had no way to actually receive a message. If SMTP
-- is configured, we also try to email the admin immediately — but the
-- message is always saved here regardless, so nothing is lost if email
-- isn't set up yet or fails.

CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read
ON contact_messages(is_read);
