-- Festival dates for the home "Today's Shloka" festival card and the
-- /festivals calendar, managed in Admin → Festivals. The festivals
-- themselves (names, greetings, verses) are in app/data/festivals.ts;
-- festival_key is one of its FESTIVAL_KINDS keys. Dates are the India
-- (IST) calendar day; end_date is inclusive, NULL for one-day festivals.
CREATE TABLE IF NOT EXISTS festival_dates (
    id           SERIAL PRIMARY KEY,
    festival_key VARCHAR(40) NOT NULL,
    start_date   DATE NOT NULL,
    end_date     DATE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_festival_dates_start ON festival_dates (start_date);

-- The 2026–27 dates that used to be hard-coded (checked 2026-09-26
-- against drikpanchang.com, dekhopanchang.com and hindupad.com). Only
-- seeded into an empty table, so re-running never duplicates or undoes
-- admin edits.
INSERT INTO festival_dates (festival_key, start_date, end_date)
SELECT v.festival_key, v.start_date::date, v.end_date::date
FROM (VALUES
    ('navaratri',          '2026-10-11', '2026-10-18'),
    ('ayudha_puja',        '2026-10-19', NULL),
    ('vijayadashami',      '2026-10-20', NULL),
    ('deepavali',          '2026-11-08', '2026-11-09'),
    ('bali_padyami',       '2026-11-10', NULL),
    ('vaikuntha_ekadashi', '2026-12-20', NULL),
    ('sankranti',          '2027-01-15', NULL),
    ('shivaratri',         '2027-03-06', NULL),
    ('ugadi',              '2027-04-07', NULL),
    ('rama_navami',        '2027-04-15', NULL),
    ('akshaya_tritiya',    '2027-05-09', NULL),
    ('guru_purnima',       '2027-07-18', NULL),
    ('varamahalakshmi',    '2027-08-13', NULL),
    ('janmashtami',        '2027-08-25', NULL),
    ('ganesha_chaturthi',  '2027-09-04', NULL),
    ('navaratri',          '2027-09-30', '2027-10-07'),
    ('ayudha_puja',        '2027-10-08', NULL),
    ('vijayadashami',      '2027-10-09', NULL),
    ('deepavali',          '2027-10-28', '2027-10-29'),
    ('bali_padyami',       '2027-10-30', NULL)
) AS v (festival_key, start_date, end_date)
WHERE NOT EXISTS (SELECT 1 FROM festival_dates);
