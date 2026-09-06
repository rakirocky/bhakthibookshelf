-- Links orders to customer accounts. Nullable — guest checkout still
-- works, it just means that order can never grant library access, since
-- there's no persistent identity to check it against later. When a
-- logged-in customer checks out, their customer_id gets attached
-- automatically (same mechanism as promoter_id attribution).

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_id INTEGER
REFERENCES customers(id)
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_customer_id
ON orders(customer_id);
