-- Payment Round 3 Fix: Add unique constraints and indexes for payment integrity

-- Prevent duplicate payment records for the same transaction
ALTER TABLE payment_records ADD CONSTRAINT uk_payment_provider_transaction_id
    UNIQUE (provider_transaction_id);

-- Add cancel_at_period_end column to subscriptions
ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for efficient webhook lookup by provider transaction id
CREATE INDEX idx_webhook_logs_provider_transaction_id ON webhook_logs(provider_transaction_id);

-- Index for finding payments by provider transaction id
CREATE INDEX idx_payment_records_provider_txn ON payment_records(provider_transaction_id);
