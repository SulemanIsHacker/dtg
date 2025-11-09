-- Create storage bucket for testimonial photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'testimonials',
  'testimonials',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view testimonial photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload testimonial photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update testimonial photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete testimonial photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on testimonials bucket" ON storage.objects;

-- Create storage policies for testimonials bucket
-- Public read access for all testimonial photos
CREATE POLICY "Public can view testimonial photos" ON storage.objects
FOR SELECT USING (bucket_id = 'testimonials');

-- Admin upload access
CREATE POLICY "Admins can upload testimonial photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'testimonials' 
  AND (
    public.has_role(auth.uid(), 'admin') OR 
    auth.uid() IS NOT NULL -- Fallback for development
  )
);

-- Admin update access
CREATE POLICY "Admins can update testimonial photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'testimonials' 
  AND (
    public.has_role(auth.uid(), 'admin') OR 
    auth.uid() IS NOT NULL -- Fallback for development
  )
);

-- Admin delete access
CREATE POLICY "Admins can delete testimonial photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'testimonials' 
  AND (
    public.has_role(auth.uid(), 'admin') OR 
    auth.uid() IS NOT NULL -- Fallback for development
  )
);

-- Temporary policy for development (remove in production)
CREATE POLICY "Allow all operations on testimonials bucket" ON storage.objects
FOR ALL USING (bucket_id = 'testimonials');
