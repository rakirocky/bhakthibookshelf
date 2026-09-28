-- The "Devotional" category is retired (client, 2026-09-29) and
-- "Prayers" becomes "Prayers & Festivals". Books filed under
-- Devotional move there; the admin can re-file any book from
-- Admin → Books → Edit.
UPDATE books SET category = 'prayers' WHERE category = 'devotional';
