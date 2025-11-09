-- Update CapCut price to Rs899
-- Run this in Supabase SQL Editor

-- Update the main product price
UPDATE public.products 
SET 
  price = 'Rs899',
  original_price = 'Rs899'
WHERE name ILIKE '%capcut%' AND category = 'Video';

-- Update any pricing plans for CapCut
UPDATE public.pricing_plans 
SET 
  price = 'Rs899',
  monthly_price = 'Rs899'
WHERE product_id IN (
    SELECT id FROM public.products 
    WHERE name ILIKE '%capcut%' AND category = 'Video'
);

-- Verify the update
SELECT name, price, original_price, category 
FROM public.products 
WHERE name ILIKE '%capcut%';
