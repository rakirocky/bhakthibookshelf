-- The language switcher (All / EN / ಕನ್ನಡ) filters books by
-- language = 'English' | 'Kannada' — the values the admin Book form
-- offers. The slider's TEST DEMO rows were seeded as 'en', so they
-- vanished under "EN". Normalize short/lowercase variants.
UPDATE books SET language = 'English'
WHERE lower(trim(language)) IN ('en', 'eng', 'english') AND language <> 'English';

UPDATE books SET language = 'Kannada'
WHERE lower(trim(language)) IN ('kn', 'kan', 'kannada') AND language <> 'Kannada';
