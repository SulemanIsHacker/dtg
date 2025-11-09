-- Check if currency column exists and has data
SELECT 
    id, 
    custom_price, 
    currency,
    subscription_type,
    subscription_period
FROM user_subscriptions 
LIMIT 5;

-- Update any subscriptions that don't have currency set
UPDATE user_subscriptions 
SET currency = 'PKR' 
WHERE currency IS NULL OR currency = '';

-- Verify the update
SELECT 
    id, 
    custom_price, 
    currency,
    subscription_type,
    subscription_period
FROM user_subscriptions 
LIMIT 5;
