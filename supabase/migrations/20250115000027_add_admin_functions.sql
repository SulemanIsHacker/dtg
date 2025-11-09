-- Add comprehensive admin functions for product code approval and rejection
-- This migration creates the necessary functions for the admin panel with full database integration

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS approve_product_code_admin(UUID, TEXT);
DROP FUNCTION IF EXISTS reject_product_code_admin(UUID, TEXT);

-- Create comprehensive function to approve product code
CREATE OR REPLACE FUNCTION approve_product_code_admin(
    p_product_code_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    pc product_codes%ROWTYPE;
    subscription_id UUID;
    purchase_request_id UUID;
    remaining_pending_count INTEGER;
    total_items_count INTEGER;
    approved_items_count INTEGER;
    rejected_items_count INTEGER;
    result JSONB;
BEGIN
    -- Start transaction
BEGIN
    -- Get product code details
    SELECT * INTO pc FROM product_codes WHERE id = p_product_code_id;
        
        -- Get purchase request ID if exists
        SELECT pri.purchase_request_id INTO purchase_request_id
        FROM purchase_request_items pri
        WHERE pri.product_code_id = p_product_code_id;
    
    IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Product code not found',
                'product_code_id', p_product_code_id
            );
    END IF;
    
    -- Check if already approved
    IF pc.status = 'approved' THEN
            RETURN jsonb_build_object(
                'success', true,
                'message', 'Product code already approved',
                'product_code_id', p_product_code_id,
                'status', 'already_approved'
            );
        END IF;
        
        -- Check if already rejected
        IF pc.status = 'rejected' THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Cannot approve a rejected product code',
                'product_code_id', p_product_code_id,
                'current_status', 'rejected'
            );
    END IF;
    
    -- Update product code status
    UPDATE product_codes 
    SET 
        status = 'approved',
        admin_notes = p_admin_notes,
        approved_at = NOW(),
            approved_by = auth.uid(),
            updated_at = NOW()
    WHERE id = p_product_code_id;
    
        -- Create user subscription record
        INSERT INTO user_subscriptions (
        user_auth_code_id,
        product_id,
        subscription_type,
        subscription_period,
            custom_price,
            currency,
        start_date,
        expiry_date,
        auto_renew,
        status,
        notes
    ) VALUES (
        pc.user_auth_code_id,
        pc.product_id,
        pc.subscription_type,
        pc.subscription_period,
            pc.price,
            pc.currency,
        NOW(),
            calculate_expiry_date(pc.subscription_period, NOW()),
        false,
        'active',
        COALESCE(p_admin_notes, 'Created from approved product code: ' || pc.code)
    ) RETURNING id INTO subscription_id;
    
        -- Update purchase request status if applicable
        IF purchase_request_id IS NOT NULL THEN
            -- Count remaining pending items in the purchase request
            SELECT COUNT(*)
            INTO remaining_pending_count
            FROM purchase_request_items pri
            JOIN product_codes pc2 ON pri.product_code_id = pc2.id
            WHERE pri.purchase_request_id = purchase_request_id
            AND pc2.status = 'pending';
            
            -- Get total counts for the purchase request
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN pc2.status = 'approved' THEN 1 END) as approved,
                COUNT(CASE WHEN pc2.status = 'rejected' THEN 1 END) as rejected
            INTO total_items_count, approved_items_count, rejected_items_count
            FROM purchase_request_items pri
            JOIN product_codes pc2 ON pri.product_code_id = pc2.id
            WHERE pri.purchase_request_id = purchase_request_id;
            
            -- Update purchase request status based on remaining items
            IF remaining_pending_count = 0 THEN
                -- All items processed, determine final status
                IF rejected_items_count = total_items_count THEN
                    -- All rejected
                    UPDATE purchase_requests 
                    SET 
                        status = 'cancelled',
                        admin_notes = COALESCE(admin_notes, '') || ' | All product codes rejected',
                        updated_at = NOW()
                    WHERE id = purchase_request_id;
                ELSIF approved_items_count = total_items_count THEN
                    -- All approved
                    UPDATE purchase_requests 
                    SET 
                        status = 'completed',
                        admin_notes = COALESCE(admin_notes, '') || ' | All product codes approved',
                        updated_at = NOW()
                    WHERE id = purchase_request_id;
                ELSE
                    -- Mixed results
                    UPDATE purchase_requests 
                    SET 
                        status = 'completed',
                        admin_notes = COALESCE(admin_notes, '') || ' | Purchase completed with mixed results',
                        updated_at = NOW()
                    WHERE id = purchase_request_id;
                END IF;
            ELSE
                -- Still has pending items, mark as processing
                UPDATE purchase_requests 
                SET 
                    status = 'processing',
                    admin_notes = COALESCE(admin_notes, '') || ' | Processing in progress',
                    updated_at = NOW()
                WHERE id = purchase_request_id;
            END IF;
        END IF;
        
        -- Build success result
        result := jsonb_build_object(
            'success', true,
            'message', 'Product code approved successfully',
            'product_code_id', p_product_code_id,
            'subscription_id', subscription_id,
            'purchase_request_id', purchase_request_id,
            'purchase_request_status', CASE 
                WHEN purchase_request_id IS NOT NULL THEN (
                    SELECT status FROM purchase_requests WHERE id = purchase_request_id
                )
                ELSE NULL
            END,
            'remaining_pending', COALESCE(remaining_pending_count, 0),
            'total_items', COALESCE(total_items_count, 0),
            'approved_items', COALESCE(approved_items_count, 0),
            'rejected_items', COALESCE(rejected_items_count, 0)
        );
        
        RETURN result;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback on error
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Database error: ' || SQLERRM,
                'product_code_id', p_product_code_id
            );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create comprehensive function to reject product code
CREATE OR REPLACE FUNCTION reject_product_code_admin(
    p_product_code_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    pc product_codes%ROWTYPE;
    purchase_request_id UUID;
    remaining_pending_count INTEGER;
    total_items_count INTEGER;
    approved_items_count INTEGER;
    rejected_items_count INTEGER;
    result JSONB;
BEGIN
    -- Start transaction
BEGIN
    -- Get product code details
    SELECT * INTO pc FROM product_codes WHERE id = p_product_code_id;
        
        -- Get purchase request ID if exists
        SELECT pri.purchase_request_id INTO purchase_request_id
        FROM purchase_request_items pri
        WHERE pri.product_code_id = p_product_code_id;
    
    IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Product code not found',
                'product_code_id', p_product_code_id
            );
    END IF;
    
    -- Check if already rejected
    IF pc.status = 'rejected' THEN
            RETURN jsonb_build_object(
                'success', true,
                'message', 'Product code already rejected',
                'product_code_id', p_product_code_id,
                'status', 'already_rejected'
            );
        END IF;
        
        -- Check if already approved
        IF pc.status = 'approved' THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Cannot reject an approved product code. Consider cancelling the subscription instead.',
                'product_code_id', p_product_code_id,
                'current_status', 'approved'
            );
    END IF;
    
    -- Update product code status
    UPDATE product_codes 
    SET 
        status = 'rejected',
        admin_notes = p_admin_notes,
        rejected_at = NOW(),
            approved_by = auth.uid(),
            updated_at = NOW()
    WHERE id = p_product_code_id;
    
        -- Update purchase request status if applicable
        IF purchase_request_id IS NOT NULL THEN
            -- Count remaining pending items in the purchase request
            SELECT COUNT(*)
            INTO remaining_pending_count
            FROM purchase_request_items pri
            JOIN product_codes pc2 ON pri.product_code_id = pc2.id
            WHERE pri.purchase_request_id = purchase_request_id
            AND pc2.status = 'pending';
            
            -- Get total counts for the purchase request
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN pc2.status = 'approved' THEN 1 END) as approved,
                COUNT(CASE WHEN pc2.status = 'rejected' THEN 1 END) as rejected
            INTO total_items_count, approved_items_count, rejected_items_count
            FROM purchase_request_items pri
            JOIN product_codes pc2 ON pri.product_code_id = pc2.id
            WHERE pri.purchase_request_id = purchase_request_id;
            
            -- Update purchase request status based on remaining items
            IF remaining_pending_count = 0 THEN
                -- All items processed, determine final status
                IF rejected_items_count = total_items_count THEN
                    -- All rejected
                    UPDATE purchase_requests 
                    SET 
                        status = 'cancelled',
                        admin_notes = COALESCE(admin_notes, '') || ' | All product codes rejected',
                        updated_at = NOW()
                    WHERE id = purchase_request_id;
                ELSIF approved_items_count = total_items_count THEN
                    -- All approved
                    UPDATE purchase_requests 
                    SET 
                        status = 'completed',
                        admin_notes = COALESCE(admin_notes, '') || ' | All product codes approved',
                        updated_at = NOW()
                    WHERE id = purchase_request_id;
                ELSE
                    -- Mixed results
                    UPDATE purchase_requests 
                    SET 
                        status = 'completed',
                        admin_notes = COALESCE(admin_notes, '') || ' | Purchase completed with mixed results',
                        updated_at = NOW()
                    WHERE id = purchase_request_id;
                END IF;
            ELSE
                -- Still has pending items, mark as processing
                UPDATE purchase_requests 
                SET 
                    status = 'processing',
                    admin_notes = COALESCE(admin_notes, '') || ' | Processing in progress',
                    updated_at = NOW()
                WHERE id = purchase_request_id;
            END IF;
        END IF;
        
        -- Build success result
        result := jsonb_build_object(
            'success', true,
            'message', 'Product code rejected successfully',
            'product_code_id', p_product_code_id,
            'purchase_request_id', purchase_request_id,
            'purchase_request_status', CASE 
                WHEN purchase_request_id IS NOT NULL THEN (
                    SELECT status FROM purchase_requests WHERE id = purchase_request_id
                )
                ELSE NULL
            END,
            'remaining_pending', COALESCE(remaining_pending_count, 0),
            'total_items', COALESCE(total_items_count, 0),
            'approved_items', COALESCE(approved_items_count, 0),
            'rejected_items', COALESCE(rejected_items_count, 0)
        );
        
        RETURN result;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback on error
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Database error: ' || SQLERRM,
                'product_code_id', p_product_code_id
            );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get purchase request summary
CREATE OR REPLACE FUNCTION get_purchase_request_summary(p_purchase_request_id UUID)
RETURNS JSONB AS $$
DECLARE
    pr purchase_requests%ROWTYPE;
    items_summary JSONB;
    result JSONB;
BEGIN
    -- Get purchase request details
    SELECT * INTO pr FROM purchase_requests WHERE id = p_purchase_request_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Purchase request not found',
            'purchase_request_id', p_purchase_request_id
        );
    END IF;
    
    -- Get items summary
    SELECT jsonb_build_object(
        'total_items', COUNT(*),
        'pending_items', COUNT(CASE WHEN pc.status = 'pending' THEN 1 END),
        'approved_items', COUNT(CASE WHEN pc.status = 'approved' THEN 1 END),
        'rejected_items', COUNT(CASE WHEN pc.status = 'rejected' THEN 1 END),
        'expired_items', COUNT(CASE WHEN pc.status = 'expired' THEN 1 END),
        'items', jsonb_agg(
            jsonb_build_object(
                'product_code_id', pc.id,
                'product_code', pc.code,
                'product_id', pc.product_id,
                'product_name', p.name,
                'subscription_type', pc.subscription_type,
                'subscription_period', pc.subscription_period,
                'price', pc.price,
                'currency', pc.currency,
                'status', pc.status,
                'admin_notes', pc.admin_notes,
                'created_at', pc.created_at,
                'approved_at', pc.approved_at,
                'rejected_at', pc.rejected_at
            )
        )
    ) INTO items_summary
    FROM purchase_request_items pri
    JOIN product_codes pc ON pri.product_code_id = pc.id
    LEFT JOIN products p ON pc.product_id = p.id
    WHERE pri.purchase_request_id = p_purchase_request_id;
    
    -- Build result
    result := jsonb_build_object(
        'success', true,
        'purchase_request', jsonb_build_object(
            'id', pr.id,
            'user_name', pr.user_name,
            'user_email', pr.user_email,
            'is_returning_user', pr.is_returning_user,
            'total_amount', pr.total_amount,
            'currency', pr.currency,
            'status', pr.status,
            'whatsapp_message_sent', pr.whatsapp_message_sent,
            'admin_notes', pr.admin_notes,
            'created_at', pr.created_at,
            'updated_at', pr.updated_at
        ),
        'items_summary', items_summary
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to bulk approve/reject product codes in a purchase request
CREATE OR REPLACE FUNCTION bulk_process_purchase_request(
    p_purchase_request_id UUID,
    p_action VARCHAR(10), -- 'approve' or 'reject'
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    pr purchase_requests%ROWTYPE;
    pc product_codes%ROWTYPE;
    processed_count INTEGER := 0;
    error_count INTEGER := 0;
    results JSONB := '[]'::JSONB;
    result JSONB;
    item_result JSONB;
BEGIN
    -- Validate action
    IF p_action NOT IN ('approve', 'reject') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid action. Must be "approve" or "reject"',
            'action', p_action
        );
    END IF;
    
    -- Get purchase request details
    SELECT * INTO pr FROM purchase_requests WHERE id = p_purchase_request_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Purchase request not found',
            'purchase_request_id', p_purchase_request_id
        );
    END IF;
    
    -- Process each pending product code
    FOR pc IN 
        SELECT pc.*
        FROM purchase_request_items pri
        JOIN product_codes pc ON pri.product_code_id = pc.id
        WHERE pri.purchase_request_id = p_purchase_request_id
        AND pc.status = 'pending'
    LOOP
        BEGIN
            IF p_action = 'approve' THEN
                item_result := approve_product_code_admin(pc.id, p_admin_notes);
            ELSE
                item_result := reject_product_code_admin(pc.id, p_admin_notes);
            END IF;
            
            IF (item_result->>'success')::BOOLEAN THEN
                processed_count := processed_count + 1;
            ELSE
                error_count := error_count + 1;
            END IF;
            
            results := results || jsonb_build_object(
                'product_code_id', pc.id,
                'product_code', pc.code,
                'result', item_result
            );
            
        EXCEPTION
            WHEN OTHERS THEN
                error_count := error_count + 1;
                results := results || jsonb_build_object(
                    'product_code_id', pc.id,
                    'product_code', pc.code,
                    'result', jsonb_build_object(
                        'success', false,
                        'error', 'Processing error: ' || SQLERRM
                    )
                );
        END;
    END LOOP;
    
    -- Build final result
    result := jsonb_build_object(
        'success', true,
        'message', 'Bulk processing completed',
        'purchase_request_id', p_purchase_request_id,
        'action', p_action,
        'processed_count', processed_count,
        'error_count', error_count,
        'results', results
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get admin dashboard statistics
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'product_codes', jsonb_build_object(
            'total', COUNT(*),
            'pending', COUNT(CASE WHEN status = 'pending' THEN 1 END),
            'approved', COUNT(CASE WHEN status = 'approved' THEN 1 END),
            'rejected', COUNT(CASE WHEN status = 'rejected' THEN 1 END),
            'expired', COUNT(CASE WHEN status = 'expired' THEN 1 END)
        ),
        'purchase_requests', jsonb_build_object(
            'total', COUNT(*),
            'pending', COUNT(CASE WHEN status = 'pending' THEN 1 END),
            'processing', COUNT(CASE WHEN status = 'processing' THEN 1 END),
            'completed', COUNT(CASE WHEN status = 'completed' THEN 1 END),
            'cancelled', COUNT(CASE WHEN status = 'cancelled' THEN 1 END)
        ),
        'user_subscriptions', jsonb_build_object(
            'total', COUNT(*),
            'active', COUNT(CASE WHEN status = 'active' THEN 1 END),
            'expiring_soon', COUNT(CASE WHEN status = 'expiring_soon' THEN 1 END),
            'expired', COUNT(CASE WHEN status = 'expired' THEN 1 END),
            'cancelled', COUNT(CASE WHEN status = 'cancelled' THEN 1 END)
        ),
        'recent_activity', jsonb_build_object(
            'pending_codes_last_24h', COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' AND status = 'pending' THEN 1 END),
            'approved_codes_last_24h', COUNT(CASE WHEN approved_at >= NOW() - INTERVAL '24 hours' THEN 1 END),
            'rejected_codes_last_24h', COUNT(CASE WHEN rejected_at >= NOW() - INTERVAL '24 hours' THEN 1 END)
        )
    ) INTO result
    FROM (
        SELECT 'product_codes' as table_name, status, created_at, approved_at, rejected_at FROM product_codes
        UNION ALL
        SELECT 'purchase_requests' as table_name, status, created_at, NULL as approved_at, NULL as rejected_at FROM purchase_requests
        UNION ALL
        SELECT 'user_subscriptions' as table_name, status, created_at, NULL as approved_at, NULL as rejected_at FROM user_subscriptions
    ) combined_stats;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION approve_product_code_admin(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_product_code_admin(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_purchase_request_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_process_purchase_request(UUID, VARCHAR, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;

