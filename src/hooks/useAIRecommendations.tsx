import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { geminiService, UserRequirements, ToolRecommendation } from '../services/geminiService';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  originalPrice?: string;
  original_price?: string;
  features: string[];
  rating: number;
  image?: string;
  slug?: string;
  main_image_url?: string;
  is_active?: boolean;
  detailed_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PricingPlan {
  id: string;
  product_id: string;
  name?: string;
  price: any;
  original_price?: any;
  duration?: string;
  features?: string[];
  is_enabled: boolean;
  plan_type?: string;
  monthly_price?: string;
  yearly_price?: string;
  description?: string;
  created_at?: string;
}

export const useAIRecommendations = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pricingPlans, setPricingPlans] = useState<Record<string, PricingPlan[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load products and pricing plans
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch pricing plans
      const productIds = ((productsData as any[]) || []).map((product: any) => product.id);
      let plansData: PricingPlan[] = [];
      
      if (productIds.length > 0) {
        const { data, error: plansError } = await supabase
          .from('pricing_plans')
          .select('*')
          .in('product_id', productIds)
          .eq('is_enabled', true);
        
        if (plansError) throw plansError;
        plansData = data || [];
      }

      // Group plans by product_id
      const plansMap: Record<string, PricingPlan[]> = {};
      plansData.forEach(plan => {
        if (!plansMap[plan.product_id]) {
          plansMap[plan.product_id] = [];
        }
        plansMap[plan.product_id].push(plan);
      });

      // Transform products to match our interface
      const transformedProducts = ((productsData as any[]) || []).map((product: any) => ({
        ...product,
        originalPrice: product.original_price
      }));
      setProducts(transformedProducts);
      setPricingPlans(plansMap);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get AI recommendations
  const getRecommendations = async (requirements: UserRequirements): Promise<ToolRecommendation[]> => {
    try {
      // Convert products to the format expected by Gemini service
      const toolsForAI = products.map(product => ({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice,
        features: product.features,
        rating: product.rating,
        image: product.main_image_url || product.image,
        slug: product.slug
      }));

      const recommendations = await geminiService.getToolRecommendations(requirements, toolsForAI);
      
      // Enhance recommendations with pricing plan information
      return recommendations.map(rec => {
        const product = products.find(p => p.name === rec.name);
        if (product && pricingPlans[product.id]) {
          const plans = pricingPlans[product.id];
          const bestPlan = plans.reduce((best, current) => 
            current.price < best.price ? current : best
          );
          
          return {
            ...rec,
            pricingPlans: plans,
            bestPlan: bestPlan
          };
        }
        return rec;
      });
    } catch (err) {
      console.error('Error getting recommendations:', err);
      throw new Error('Failed to get AI recommendations. Please try again.');
    }
  };

  // Get product by slug
  const getProductBySlug = (slug: string): Product | undefined => {
    return products.find(product => product.slug === slug);
  };

  // Get products by category
  const getProductsByCategory = (category: string): Product[] => {
    return products.filter(product => product.category === category);
  };

  // Search products
  const searchProducts = (query: string): Product[] => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.features.some(feature => feature.toLowerCase().includes(lowercaseQuery))
    );
  };

  // Get categories
  const getCategories = (): string[] => {
    const categories = new Set(products.map(product => product.category));
    return Array.from(categories).sort();
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    pricingPlans,
    loading,
    error,
    loadProducts,
    getRecommendations,
    getProductBySlug,
    getProductsByCategory,
    searchProducts,
    getCategories
  };
};
