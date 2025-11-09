-- Fix RLS policies for Finance Management tables
-- Add WITH CHECK clauses for INSERT operations

-- Fix incoming_payments policy
DROP POLICY IF EXISTS "Admins can manage incoming payments" ON incoming_payments;

CREATE POLICY "Admins can manage incoming payments"
ON incoming_payments
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix vendor_profiles policy
DROP POLICY IF EXISTS "Admins can manage vendor profiles" ON vendor_profiles;

CREATE POLICY "Admins can manage vendor profiles"
ON vendor_profiles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix vendor_transactions policy
DROP POLICY IF EXISTS "Admins can manage vendor transactions" ON vendor_transactions;

CREATE POLICY "Admins can manage vendor transactions"
ON vendor_transactions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix financial_adjustments policy
DROP POLICY IF EXISTS "Admins can manage financial adjustments" ON financial_adjustments;

CREATE POLICY "Admins can manage financial adjustments"
ON financial_adjustments
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));