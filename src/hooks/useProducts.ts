import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  slug: string; // Add slug field
  description: string;
  detailed_description?: string;
  price: string;
  original_price: string;
  category: string;
  rating: number;
  features: string[];
  main_image_url?: string;
  video_url?: string;
  video_thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  pricing_plans?: Array<{
    id: string;
    product_id: string;
    plan_type: string;
    is_enabled: boolean;
    price?: string;
    monthly_price?: string;
    yearly_price?: string;
    description?: string;
  }>;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
}

export interface PricingPlan {
  id: string;
  product_id: string;
  plan_type: 'shared' | 'semi_private' | 'private';
  is_enabled: boolean;
  price?: string;
  monthly_price?: string;
  yearly_price?: string;
  description?: string;
}


function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, description, detailed_description, price, original_price, category, rating, features, main_image_url, video_url, video_thumbnail_url, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'slug'>) => {
    try {
      const slug = generateSlug(productData.name);
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, slug }])
        .select('id, name, slug, description, detailed_description, price, original_price, category, rating, features, main_image_url, video_url, video_thumbnail_url, created_at, updated_at')
        .single();

      if (error) throw error;
      setProducts(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add product');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      let updateData = { ...updates };
      if (updates.name) {
        updateData.slug = generateSlug(updates.name);
      }
      
      console.log('Updating product with data:', { id, updateData });
      
      // First, let's check what the current product data looks like
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching current product:', fetchError);
        throw new Error('Product not found');
      }
      
      console.log('Current product data:', currentProduct);
      console.log('Update data:', updateData);
      
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select('id, name, slug, description, detailed_description, price, original_price, category, rating, features, main_image_url, video_url, video_thumbnail_url, created_at, updated_at');

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No rows returned from update - this means no changes were made');
        // If no changes were made, return the current product data
        setProducts(prev => prev.map(p => p.id === id ? currentProduct : p));
        return currentProduct;
      }
      
      const updatedProduct = data[0];
      console.log('Product updated successfully:', updatedProduct);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      console.error('Error in updateProduct:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  };
};

export const useProductImages = (productId?: string) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      console.error('Failed to fetch product images:', err);
    } finally {
      setLoading(false);
    }
  };

  const addImage = async (imageData: Omit<ProductImage, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .insert([imageData])
        .select()
        .single();

      if (error) throw error;
      setImages(prev => [...prev, data]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add image');
    }
  };

  useEffect(() => {
    if (productId) {
      fetchImages(productId);
    }
  }, [productId]);

  return { images, loading, addImage, refetch: () => productId && fetchImages(productId) };
};

export const usePricingPlans = (productId?: string) => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('product_id', id);

      if (error) throw error;
      setPlans((data || []) as PricingPlan[]);
    } catch (err) {
      console.error('Failed to fetch pricing plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (id: string, updates: Partial<PricingPlan>) => {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPlans(prev => prev.map(p => p.id === id ? (data as PricingPlan) : p));
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update plan');
    }
  };

  useEffect(() => {
    if (productId) {
      fetchPlans(productId);
    }
  }, [productId]);

  return { plans, loading, updatePlan, refetch: () => productId && fetchPlans(productId) };
};
