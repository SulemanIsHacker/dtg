-- Add currency field to user_subscriptions table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_subscriptions' 
        AND column_name = 'currency'
    ) THEN
        ALTER TABLE user_subscriptions 
        ADD COLUMN currency VARCHAR(3) DEFAULT 'PKR' CHECK (currency IN ('PKR', 'USD', 'EUR', 'GBP'));
        
        -- Add comment to explain the field
        COMMENT ON COLUMN user_subscriptions.currency IS 'Currency for the subscription price. Defaults to PKR.';
    END IF;
END $$;

-- Create index for better query performance (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_currency ON user_subscriptions(currency);

-- Update existing subscriptions to have PKR currency (they will remain PKR)
UPDATE user_subscriptions SET currency = 'PKR' WHERE currency IS NULL;
