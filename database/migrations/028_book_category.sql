-- Book categories for the Library filter chips and the footer category
-- links (Scriptures / Epics / Prayers / Devotional). Optional: a book
-- without one still shows under "All".
ALTER TABLE books
ADD COLUMN IF NOT EXISTS category VARCHAR(30);
