ALTER TABLE subscriptions ADD COLUMN payment_id VARCHAR(255) AFTER customer_id;
ALTER TABLE subscriptions ADD COLUMN start_time TIMESTAMP NULL AFTER payment_id;
ALTER TABLE subscriptions ADD COLUMN expire_time TIMESTAMP NULL AFTER start_time;