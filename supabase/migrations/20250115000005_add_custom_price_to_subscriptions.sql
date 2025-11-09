-- Add custom_price field to user_subscriptions table
ALTER TABLE user_subscriptions 
ADD COLUMN custom_price DECIMAL(10,2) DEFAULT NULL;

-- Add comment to explain the field
COMMENT ON COLUMN user_subscriptions.custom_price IS 'Custom price set by admin for this subscription. If NULL, default pricing will be used.';

-- Create an index for better query performance
CREATE INDEX idx_user_subscriptions_custom_price ON user_subscriptions(custom_price);

-- Update existing subscriptions to have NULL custom_price (they will use default pricing)
UPDATE user_subscriptions SET custom_price = NULL WHERE custom_price IS NULL;

