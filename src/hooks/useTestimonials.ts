import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Testimonial } from '@/data/testimonials';

export interface TestimonialFormData {
  name: string;
  role: string;
  company?: string;
  rating: number;
  content: string;
  type: 'text' | 'video' | 'image';
  videoUrl?: string;
  imageUrl?: string;
  productSlug: string;
  verified: boolean;
  testimonialContentPhotoUrl?: string;
  testimonialContentPhotoPath?: string;
}

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonials' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials((data || []) as unknown as Testimonial[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const addTestimonial = async (testimonialData: TestimonialFormData) => {
    try {
      const insertData = {
        name: testimonialData.name,
        role: testimonialData.role,
        company: testimonialData.company || null,
        rating: testimonialData.rating,
        content: testimonialData.content,
        type: testimonialData.type,
        video_url: testimonialData.videoUrl || null,
        image_url: testimonialData.imageUrl || null,
        product_slug: testimonialData.productSlug,
        verified: testimonialData.verified,
        testimonial_content_photo_url: testimonialData.testimonialContentPhotoUrl || null,
        testimonial_content_photo_path: testimonialData.testimonialContentPhotoPath || null,
        date: new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('testimonials' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }
      await fetchTestimonials();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add testimonial');
    }
  };

  const updateTestimonial = async (id: string, testimonialData: Partial<TestimonialFormData>) => {
    try {
      const updateData: any = {};
      if (testimonialData.name !== undefined) updateData.name = testimonialData.name;
      if (testimonialData.role !== undefined) updateData.role = testimonialData.role;
      if (testimonialData.company !== undefined) updateData.company = testimonialData.company;
      if (testimonialData.rating !== undefined) updateData.rating = testimonialData.rating;
      if (testimonialData.content !== undefined) updateData.content = testimonialData.content;
      if (testimonialData.type !== undefined) updateData.type = testimonialData.type;
      if (testimonialData.videoUrl !== undefined) updateData.video_url = testimonialData.videoUrl;
      if (testimonialData.imageUrl !== undefined) updateData.image_url = testimonialData.imageUrl;
      if (testimonialData.productSlug !== undefined) updateData.product_slug = testimonialData.productSlug;
      if (testimonialData.verified !== undefined) updateData.verified = testimonialData.verified;
      if (testimonialData.testimonialContentPhotoUrl !== undefined) updateData.testimonial_content_photo_url = testimonialData.testimonialContentPhotoUrl;
      if (testimonialData.testimonialContentPhotoPath !== undefined) updateData.testimonial_content_photo_path = testimonialData.testimonialContentPhotoPath;

      const { data, error } = await supabase
        .from('testimonials' as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchTestimonials();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update testimonial');
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchTestimonials();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete testimonial');
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return {
    testimonials,
    loading,
    error,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    refetch: fetchTestimonials
  };
};
