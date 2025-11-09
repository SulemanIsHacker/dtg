-- Create a pricing plans table to support multiple plans per product
CREATE TABLE public.pricing_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  plan_type text NOT NULL, -- 'shared', 'semi_private', 'private'
  monthly_price text NULL,
  yearly_price text NULL,
  description text NULL,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Pricing plans are viewable by everyone" 
ON public.pricing_plans 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage pricing plans" 
ON public.pricing_plans 
FOR ALL 
USING (true)
WITH CHECK (true);