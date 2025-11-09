import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Testimonial } from '@/data/testimonials';

export const useProductTestimonials = (productSlug?: string) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    if (!productSlug) {
      setTestimonials([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('testimonials' as any)
        .select('*')
        .eq('product_slug', productSlug)
        .eq('verified', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      setTestimonials((data || []) as unknown as Testimonial[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch testimonials');
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [productSlug]);

  return {
    testimonials,
    loading,
    error,
    refetch: fetchTestimonials
  };
};

