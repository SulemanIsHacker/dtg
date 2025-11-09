-- Finance Management Panel Database Schema

-- 1. Vendor Profiles Table
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name TEXT NOT NULL UNIQUE,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    payment_method TEXT,
    account_details JSONB,
    products_supplied TEXT[],
    total_paid DECIMAL(10,2) DEFAULT 0,
    total_due DECIMAL(10,2) DEFAULT 0,
    next_payment_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Incoming Payments Table
CREATE TABLE IF NOT EXISTS public.incoming_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    user_auth_code_id UUID REFERENCES public.user_auth_codes(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    transaction_id TEXT,
    payment_proof_url TEXT,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_by UUID REFERENCES auth.users(id),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Vendor Transactions Table
CREATE TABLE IF NOT EXISTS public.vendor_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    vendor_contact TEXT,
    vendor_email TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) DEFAULT 'purchase',
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    description TEXT,
    receipt_url TEXT,
    admin_notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Financial Adjustments Table
CREATE TABLE IF NOT EXISTS public.financial_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    reason TEXT NOT NULL,
    reference_table TEXT,
    reference_id UUID,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incoming_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only)
CREATE POLICY "Admins can manage vendor profiles"
ON public.vendor_profiles FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage incoming payments"
ON public.incoming_payments FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage vendor transactions"
ON public.vendor_transactions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage financial adjustments"
ON public.financial_adjustments FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_vendor_profiles_updated_at
BEFORE UPDATE ON public.vendor_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incoming_payments_updated_at
BEFORE UPDATE ON public.incoming_payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_transactions_updated_at
BEFORE UPDATE ON public.vendor_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function: Get Financial Summary
CREATE OR REPLACE FUNCTION public.get_financial_summary(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE(
    total_income DECIMAL(10,2),
    total_expenses DECIMAL(10,2),
    total_refunds DECIMAL(10,2),
    net_profit DECIMAL(10,2),
    pending_payments INTEGER,
    pending_vendor_payments INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(ip.amount) FILTER (WHERE ip.payment_status = 'confirmed'), 0) as total_income,
        COALESCE(SUM(vt.amount) FILTER (WHERE vt.payment_status = 'paid'), 0) as total_expenses,
        COALESCE(SUM(fa.amount) FILTER (WHERE fa.adjustment_type = 'refund'), 0) as total_refunds,
        COALESCE(SUM(ip.amount) FILTER (WHERE ip.payment_status = 'confirmed'), 0) - 
        COALESCE(SUM(vt.amount) FILTER (WHERE vt.payment_status = 'paid'), 0) -
        COALESCE(SUM(fa.amount) FILTER (WHERE fa.adjustment_type = 'refund'), 0) as net_profit,
        COUNT(ip.id) FILTER (WHERE ip.payment_status = 'pending')::INTEGER as pending_payments,
        COUNT(vt.id) FILTER (WHERE vt.payment_status = 'pending')::INTEGER as pending_vendor_payments
    FROM incoming_payments ip
    FULL OUTER JOIN vendor_transactions vt ON DATE(ip.payment_date) = DATE(vt.payment_date)
    FULL OUTER JOIN financial_adjustments fa ON DATE(ip.payment_date) = DATE(fa.created_at)
    WHERE DATE(COALESCE(ip.payment_date, vt.payment_date, fa.created_at)) BETWEEN p_start_date AND p_end_date;
END;
$$;

-- Function: Auto-sync payment when subscription is created
CREATE OR REPLACE FUNCTION public.sync_incoming_payment_on_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_email TEXT;
    v_user_name TEXT;
BEGIN
    -- Get user details
    SELECT user_email, user_name INTO v_user_email, v_user_name
    FROM user_auth_codes
    WHERE id = NEW.user_auth_code_id;
    
    -- Create incoming payment record
    INSERT INTO incoming_payments (
        customer_name,
        customer_email,
        user_auth_code_id,
        subscription_id,
        product_id,
        amount,
        currency,
        payment_status,
        payment_date
    ) VALUES (
        v_user_name,
        v_user_email,
        NEW.user_auth_code_id,
        NEW.id,
        NEW.product_id,
        COALESCE(NEW.custom_price, 0),
        NEW.currency,
        'confirmed',
        NEW.created_at
    );
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER sync_payment_on_subscription_create
AFTER INSERT ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.sync_incoming_payment_on_subscription();

-- Function: Update vendor totals when transaction changes
CREATE OR REPLACE FUNCTION public.update_vendor_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.vendor_id IS NOT NULL THEN
        UPDATE vendor_profiles SET
            total_paid = (
                SELECT COALESCE(SUM(amount), 0)
                FROM vendor_transactions
                WHERE vendor_id = NEW.vendor_id AND payment_status = 'paid'
            ),
            total_due = (
                SELECT COALESCE(SUM(amount), 0)
                FROM vendor_transactions
                WHERE vendor_id = NEW.vendor_id AND payment_status = 'pending'
            ),
            updated_at = NOW()
        WHERE id = NEW.vendor_id;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_vendor_totals_on_transaction
AFTER INSERT OR UPDATE ON public.vendor_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_vendor_totals();