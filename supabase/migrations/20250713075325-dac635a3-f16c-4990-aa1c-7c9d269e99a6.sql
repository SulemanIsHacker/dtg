-- Create comparison features table to manage what fields can be compared
CREATE TABLE public.comparison_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comparison_features ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Comparison features are viewable by everyone" 
ON public.comparison_features 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage comparison features" 
ON public.comparison_features 
FOR ALL 
USING (true);

-- Insert default comparison features
INSERT INTO public.comparison_features (name, description, display_order) VALUES
('Price', 'Monthly pricing comparison', 1),
('Features', 'Core features included', 2),
('Rating', 'User ratings and reviews', 3),
('Category', 'Product category', 4),
('Support', 'Support availability', 5),
('Access Type', 'Shared/Private access options', 6);

-- Create social shares tracking table (optional, for analytics)
CREATE TABLE public.social_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  platform TEXT NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for social shares
CREATE POLICY "Anyone can create social shares" 
ON public.social_shares 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can view social shares" 
ON public.social_shares 
FOR SELECT 
USING (true);