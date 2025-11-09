-- Fix column name references in admin functions
-- This migration fixes the mismatch between 'product_code' and 'code' column names

-- Drop and recreate the admin functions with correct column names
DROP FUNCTION IF EXISTS approve_product_code_admin(UUID, TEXT);
DROP FUNCTION IF EXISTS reject_product_code_admin(UUID, TEXT);

-- Create comprehensive function to approve product code with correct column names
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

-- Create comprehensive function to reject product code with correct column names
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION approve_product_code_admin(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_product_code_admin(UUID, TEXT) TO authenticated;

