-- Razorpay integration. orders already had payment_method/payment_id/
-- razorpay_order_id from the original Module 3 setup, but no migration
-- file ever created them — meaning a fresh database wouldn't have had
-- them. Using IF NOT EXISTS everywhere so this is safe to run whether
-- or not those columns already exist.

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);

-- subscriptions never had any of these — added fresh here.
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30);

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100);

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id
ON orders(razorpay_order_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_order_id
ON subscriptions(razorpay_order_id);
