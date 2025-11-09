-- Create refund_requests table
CREATE TABLE IF NOT EXISTS refund_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    order_id VARCHAR(255) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed')),
    proof_files JSONB DEFAULT '[]',
    admin_notes TEXT,
    refund_amount DECIMAL(10,2),
    refund_method VARCHAR(50),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_refund_requests_ticket_id ON refund_requests(ticket_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_email ON refund_requests(email);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_created_at ON refund_requests(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_refund_requests_updated_at 
    BEFORE UPDATE ON refund_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for proof files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('refund-proofs', 'refund-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS (Row Level Security) policies
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Policy for customers to view their own requests
CREATE POLICY "Customers can view own refund requests" ON refund_requests
    FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Policy for admins to manage all requests
CREATE POLICY "Admins can manage all refund requests" ON refund_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN ('admin@toolsy.store', 'support@toolsy.store')
        )
    );

-- Policy for service role to insert requests
CREATE POLICY "Service role can insert refund requests" ON refund_requests
    FOR INSERT WITH CHECK (true);
