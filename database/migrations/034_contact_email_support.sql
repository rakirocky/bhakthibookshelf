-- Contact email moves from the Gmail address to the domain mailbox
-- (owner, 2026-09-29). Only replaces the old Gmail value or a blank one,
-- so an address the admin has set deliberately is left alone.
UPDATE settings
SET contact_email = 'support@bhakthibookshelf.in', updated_at = CURRENT_TIMESTAMP
WHERE contact_email IS NULL
   OR TRIM(contact_email) = ''
   OR LOWER(TRIM(contact_email)) = 'bhakthibookshelf@gmail.com';
