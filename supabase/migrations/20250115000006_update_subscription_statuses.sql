-- Function to update subscription statuses based on current expiry dates
CREATE OR REPLACE FUNCTION update_subscription_statuses()
RETURNS TABLE(
    updated_count INTEGER,
    active_count INTEGER,
    expiring_soon_count INTEGER,
    expired_count INTEGER
) AS $$
DECLARE
    active_updated INTEGER := 0;
    expiring_soon_updated INTEGER := 0;
    expired_updated INTEGER := 0;
BEGIN
    -- Update expired subscriptions
    UPDATE user_subscriptions 
    SET status = 'expired', updated_at = NOW()
    WHERE expiry_date <= NOW() 
    AND status != 'expired'
    AND status != 'cancelled';
    
    GET DIAGNOSTICS expired_updated = ROW_COUNT;
    
    -- Update expiring soon subscriptions
    UPDATE user_subscriptions 
    SET status = 'expiring_soon', updated_at = NOW()
    WHERE expiry_date > NOW() 
    AND expiry_date <= NOW() + INTERVAL '7 days'
    AND status = 'active';
    
    GET DIAGNOSTICS expiring_soon_updated = ROW_COUNT;
    
    -- Update active subscriptions (those that are not expiring soon or expired)
    UPDATE user_subscriptions 
    SET status = 'active', updated_at = NOW()
    WHERE expiry_date > NOW() + INTERVAL '7 days'
    AND status IN ('expiring_soon', 'expired')
    AND status != 'cancelled';
    
    GET DIAGNOSTICS active_updated = ROW_COUNT;
    
    -- Return statistics
    RETURN QUERY SELECT 
        (active_updated + expiring_soon_updated + expired_updated) as updated_count,
        active_updated as active_count,
        expiring_soon_updated as expiring_soon_count,
        expired_updated as expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription expiry statistics
CREATE OR REPLACE FUNCTION get_subscription_expiry_stats()
RETURNS TABLE(
    total_subscriptions INTEGER,
    active_subscriptions INTEGER,
    expiring_soon_subscriptions INTEGER,
    expired_subscriptions INTEGER,
    cancelled_subscriptions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_subscriptions,
        COUNT(*) FILTER (WHERE status = 'active')::INTEGER as active_subscriptions,
        COUNT(*) FILTER (WHERE status = 'expiring_soon')::INTEGER as expiring_soon_subscriptions,
        COUNT(*) FILTER (WHERE status = 'expired')::INTEGER as expired_subscriptions,
        COUNT(*) FILTER (WHERE status = 'cancelled')::INTEGER as cancelled_subscriptions
    FROM user_subscriptions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_subscription_statuses() TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_expiry_stats() TO authenticated;
