import { supabase } from '@/integrations/supabase/client';

export const useSupabaseStorage = () => {
  const uploadFile = async (file: File, bucket: string, path: string) => {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrl,
        path: filePath
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  };

  const deleteFile = async (bucket: string, path: string) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  };

  const getPublicUrl = (bucket: string, path: string) => {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return publicUrl;
  };

  return {
    uploadFile,
    deleteFile,
    getPublicUrl
  };
};