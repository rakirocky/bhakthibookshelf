-- Single-active-session login (owner decision, 2026-09-19): a customer
-- account can only be signed in on one device at a time. A login
-- attempt while another session is still active is rejected outright
-- (not "silently kick the old device") — see
-- app/api/customer/login/route.ts. active_session_expires_at mirrors
-- the JWT's own expiry so a session that's simply timed out (lost
-- phone, cleared cookies, whatever) stops blocking new logins on its
-- own without needing the old device to explicitly log out.

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS active_session_id VARCHAR(64),
ADD COLUMN IF NOT EXISTS active_session_expires_at TIMESTAMPTZ;
