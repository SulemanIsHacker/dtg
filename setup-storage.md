# Storage Bucket Setup Instructions

## Issue
The testimonial photo upload is failing with 400 errors because the storage bucket doesn't exist or has incorrect policies.

## Solution

### Option 1: Run the Migration (Recommended)
1. Make sure you're connected to your Supabase project
2. Run the migration:
   ```bash
   supabase db push
   ```

### Option 2: Manual Setup via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create a new bucket with these settings:
   - **Name**: `testimonials`
   - **Public**: ✅ Yes
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

4. Go to Storage > Policies
5. Create these policies for the `testimonials` bucket:

   **Policy 1: Public Read Access**
   - Name: `Public can view testimonial photos`
   - Operation: SELECT
   - Target roles: public
   - Policy definition: `bucket_id = 'testimonials'`

   **Policy 2: Admin Upload Access**
   - Name: `Admins can upload testimonial photos`
   - Operation: INSERT
   - Target roles: authenticated
   - Policy definition: `bucket_id = 'testimonials'`

   **Policy 3: Admin Update Access**
   - Name: `Admins can update testimonial photos`
   - Operation: UPDATE
   - Target roles: authenticated
   - Policy definition: `bucket_id = 'testimonials'`

   **Policy 4: Admin Delete Access**
   - Name: `Admins can delete testimonial photos`
   - Operation: DELETE
   - Target roles: authenticated
   - Policy definition: `bucket_id = 'testimonials'`

### Option 3: SQL Commands
Run these SQL commands in your Supabase SQL editor:

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'testimonials',
  'testimonials',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create policies
CREATE POLICY "Public can view testimonial photos" ON storage.objects
FOR SELECT USING (bucket_id = 'testimonials');

CREATE POLICY "Allow all operations on testimonials bucket" ON storage.objects
FOR ALL USING (bucket_id = 'testimonials');
```

## Testing
After setting up the bucket:
1. Try uploading a photo in the admin panel
2. Check the browser console for detailed error messages
3. Verify the photo appears in the testimonial list

## Troubleshooting
- If you still get 400 errors, check that the bucket is public
- Ensure the file size is under 5MB
- Verify the file type is supported (JPEG, PNG, WebP, GIF)
- Check that you're authenticated as an admin user
