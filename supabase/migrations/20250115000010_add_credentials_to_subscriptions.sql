-- Add username and password fields to user_subscriptions table
ALTER TABLE user_subscriptions 
ADD COLUMN username VARCHAR(255) DEFAULT NULL,
ADD COLUMN password VARCHAR(255) DEFAULT NULL;

-- Add comments to explain the fields
COMMENT ON COLUMN user_subscriptions.username IS 'Optional username for the subscription account. Set by admin during subscription creation.';
COMMENT ON COLUMN user_subscriptions.password IS 'Optional password for the subscription account. Set by admin during subscription creation.';

-- Create indexes for better query performance
CREATE INDEX idx_user_subscriptions_username ON user_subscriptions(username);
CREATE INDEX idx_user_subscriptions_password ON user_subscriptions(password);

-- Update existing subscriptions to have NULL credentials (they will remain empty)
UPDATE user_subscriptions SET username = NULL, password = NULL WHERE username IS NULL AND password IS NULL;
