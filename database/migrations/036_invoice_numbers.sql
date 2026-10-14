-- GST invoice numbers: ONE running sequence shared by book orders and
-- subscriptions (0001, 0002, ... — no gaps per purchase type), assigned
-- the moment a purchase becomes PAID and never changed afterwards.
-- The app formats it as BB-EB-0001 (eBook order) / BB-LT-0001 (lifetime
-- subscription); only the number is stored.

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_no INTEGER UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoiced_at TIMESTAMPTZ;

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS invoice_no INTEGER UNIQUE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS invoiced_at TIMESTAMPTZ;

-- Back-fill: every purchase already paid gets the next numbers, oldest
-- first, so new invoices continue from there (20 paid so far -> the
-- next one is 0021). Orders are dated by created_at (payment follows
-- within minutes; updated_at moves on later admin edits), subscriptions
-- by starts_at (set when paid).
WITH paid AS (
    SELECT 'o' AS kind, id, created_at::timestamptz AS paid_at
    FROM orders
    WHERE payment_status = 'PAID' AND invoice_no IS NULL
    UNION ALL
    SELECT 's', id, COALESCE(starts_at, updated_at, created_at)
    FROM subscriptions
    WHERE payment_status = 'PAID' AND invoice_no IS NULL
),
numbered AS (
    SELECT
        kind, id, paid_at,
        (
            SELECT COALESCE(MAX(n), 0) FROM (
                SELECT invoice_no AS n FROM orders
                UNION ALL
                SELECT invoice_no FROM subscriptions
            ) existing
        ) + ROW_NUMBER() OVER (ORDER BY paid_at, kind, id) AS no
    FROM paid
),
upd_orders AS (
    UPDATE orders o
    SET invoice_no = n.no, invoiced_at = n.paid_at
    FROM numbered n
    WHERE n.kind = 'o' AND n.id = o.id
    RETURNING o.id
)
UPDATE subscriptions s
SET invoice_no = n.no, invoiced_at = n.paid_at
FROM numbered n
WHERE n.kind = 's' AND n.id = s.id;

SELECT setval(
    'invoice_number_seq',
    GREATEST(m.max_no, 1),
    m.max_no > 0
)
FROM (
    SELECT COALESCE(MAX(n), 0) AS max_no FROM (
        SELECT invoice_no AS n FROM orders
        UNION ALL
        SELECT invoice_no FROM subscriptions
    ) x
) m;

-- Assigned in the database, not the app, so every path that marks a
-- purchase PAID (Razorpay verify, webhook, reconcile, admin Mark Paid)
-- gets a number exactly once. A concurrent second UPDATE waits on the
-- row lock and then sees invoice_no already set.
CREATE OR REPLACE FUNCTION assign_invoice_no() RETURNS trigger AS $$
BEGIN
    IF NEW.payment_status = 'PAID' AND NEW.invoice_no IS NULL THEN
        NEW.invoice_no := nextval('invoice_number_seq');
        NEW.invoiced_at := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_assign_invoice_no ON orders;
CREATE TRIGGER orders_assign_invoice_no
    BEFORE INSERT OR UPDATE OF payment_status ON orders
    FOR EACH ROW EXECUTE FUNCTION assign_invoice_no();

DROP TRIGGER IF EXISTS subscriptions_assign_invoice_no ON subscriptions;
CREATE TRIGGER subscriptions_assign_invoice_no
    BEFORE INSERT OR UPDATE OF payment_status ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION assign_invoice_no();
