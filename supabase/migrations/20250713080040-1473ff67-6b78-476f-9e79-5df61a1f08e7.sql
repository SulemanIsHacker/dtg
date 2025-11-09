-- Add comparison settings to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS enable_comparison BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS comparison_data JSONB DEFAULT '{}';

-- Create product comparison values table for storing product-specific comparison data
CREATE TABLE IF NOT EXISTS public.product_comparison_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES public.comparison_features(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, feature_id)
);

-- Enable RLS
ALTER TABLE public.product_comparison_values ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Product comparison values are viewable by everyone" 
ON public.product_comparison_values 
FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Admin can manage product comparison values" 
ON public.product_comparison_values 
FOR ALL 
USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_product_comparison_values_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_product_comparison_values_updated_at ON public.product_comparison_values;
CREATE TRIGGER update_product_comparison_values_updated_at
  BEFORE UPDATE ON public.product_comparison_values
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_comparison_values_updated_at();