-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  price TEXT NOT NULL,
  original_price TEXT NOT NULL,
  category TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 4.5,
  features TEXT[] DEFAULT '{}',
  main_image_url TEXT,
  slug text unique not null,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product images table for multiple images per product
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pricing plans table
CREATE TABLE public.pricing_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('shared', 'semi_private', 'private')),
  is_enabled BOOLEAN DEFAULT true,
  price TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Create policies - Make products readable by everyone
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Product images are viewable by everyone" 
ON public.product_images 
FOR SELECT 
USING (true);

CREATE POLICY "Pricing plans are viewable by everyone" 
ON public.pricing_plans 
FOR SELECT 
USING (true);

-- Admin can do everything (we'll implement proper admin authentication later)
CREATE POLICY "Admin can manage products" 
ON public.products 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can manage product images" 
ON public.product_images 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can manage pricing plans" 
ON public.pricing_plans 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data from existing tools
INSERT INTO public.products (name, description, detailed_description, price, original_price, category, rating, features, main_image_url) VALUES
('CapCut Pro', 'Professional video editing with AI features, unlimited exports, and premium templates.', 'CapCut Pro is the ultimate video editing solution for content creators, marketers, and professionals. With advanced AI-powered features, you can create stunning videos with minimal effort. The tool includes automated editing suggestions, smart cropping, and professional-grade color correction. Whether you''re creating social media content, marketing videos, or professional presentations, CapCut Pro provides all the tools you need.', '$5', '$20', 'Video', 4.8, ARRAY['AI video editing tools', 'Unlimited exports', 'Premium templates & effects', '4K video support', 'Multi-track editing'], '/src/assets/capcut-pro.jpg'),
('ChatGPT Plus', 'Access to GPT-4, faster responses, and priority access during peak times.', 'ChatGPT Plus gives you access to the most advanced AI language model, GPT-4, with lightning-fast responses and priority access during peak times. Perfect for content creation, coding assistance, research, and creative writing. The subscription includes access to DALL-E 3 for image generation and browsing capabilities for real-time information.', '$5', '$20', 'AI', 4.9, ARRAY['GPT-4 access', 'Faster response times', 'Priority access', 'Browse with Bing', 'DALL-E 3 integration'], '/src/assets/chatgpt-plus.jpg'),
('Canva Pro', 'Premium design tools, unlimited storage, and brand kit for professional designs.', 'Canva Pro transforms your design workflow with access to over 100 million premium photos, videos, and graphics. Create professional marketing materials, social media content, and presentations with ease. The brand kit feature ensures consistent branding across all your designs, while the background remover and resize tools save hours of work.', '$3', '$15', 'Design', 4.7, ARRAY['Premium templates', 'Background remover', 'Brand kit', '100GB cloud storage', 'Resize designs instantly'], '/src/assets/canva-pro.jpg');

-- Add slug column
alter table products add column slug text unique not null;

-- Backfill slugs for existing products
update products set slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));

ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX products_slug_key ON products(slug);