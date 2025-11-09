-- Fix CapCut price to Rs899 as expected
UPDATE public.products 
SET price = 'Rs899', original_price = 'Rs899'
WHERE name ILIKE '%capcut%' AND category = 'Video';

-- Also update any pricing plans for CapCut
UPDATE public.pricing_plans 
SET price = 'Rs899', monthly_price = 'Rs899'
WHERE product_id IN (
    SELECT id FROM public.products 
    WHERE name ILIKE '%capcut%' AND category = 'Video'
);
