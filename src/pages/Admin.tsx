import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Eye, Trash2, Save, X, LogOut } from 'lucide-react';
import { useProducts, Product, useProductImages } from '@/hooks/useProducts';
import { useTestimonials, TestimonialFormData } from '@/hooks/useTestimonials';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';
import { AdminLogin } from '@/components/AdminLogin';
import { validateProductData, sanitizeProductData } from '@/utils/validation';
import TestimonialForm from '@/components/TestimonialForm';
import { TestimonialManager } from '@/components/TestimonialManager';
import { SubscriptionAdmin } from '@/components/SubscriptionAdmin';
import { ProductCodeAdmin } from '@/components/ProductCodeAdmin';
import { TestProductCodeGeneration } from '@/components/TestProductCodeGeneration';
import { RefundRequestsAdmin } from '@/components/RefundRequestsAdmin';

const categories = ["AI", "Design", "Video", "Writing", "SEO", "Productivity", "Creative"];

// ProductForm moved outside Admin to prevent remounting and focus loss
function ProductForm({
  formData,
  handleInputChange,
  handleFeatureChange,
  addFeature,
  removeFeature,
  isEditing,
  isAdding,
  saveProduct,
  loading,
  setPreviewProduct,
  resetForm,
  categories,
  videoUrls,
  setVideoUrls,
  imageUrls,
  setImageUrls
}: {
  formData: any,
  handleInputChange: (field: string, value: any) => void,
  handleFeatureChange: (index: number, value: string) => void,
  addFeature: () => void,
  removeFeature: (index: number) => void,
  isEditing: boolean,
  isAdding: boolean,
  saveProduct: () => void,
  loading: boolean,
  setPreviewProduct: (product: any) => void,
  resetForm: () => void,
  categories: string[],
  videoUrls: string[],
  setVideoUrls: (urls: string[]) => void,
  imageUrls: string[],
  setImageUrls: (urls: string[]) => void
}) {
  const handleVideoUrlChange = (index: number, value: string) => {
    const newUrls = [...videoUrls];
    newUrls[index] = value;
    setVideoUrls(newUrls);
  };
  const addVideoUrl = () => setVideoUrls([...videoUrls, '']);
  const removeVideoUrl = (index: number) => setVideoUrls(videoUrls.filter((_, i) => i !== index));
  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };
  const addImageUrl = () => setImageUrls([...imageUrls, '']);
  const removeImageUrl = (index: number) => setImageUrls(imageUrls.filter((_, i) => i !== index));
  
  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter product name"
            maxLength={200}
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="original_price">Original Price *</Label>
          <Input
            id="original_price"
            value={formData.original_price || ''}
            onChange={(e) => handleInputChange('original_price', e.target.value)}
            placeholder="NGN 2000"
          />
        </div>
        <div>
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={formData.rating || 4.5}
            onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
          />
        </div>
      </div>
      
      {/* Multi-Plan Pricing Section */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Pricing Plans</Label>
        <div className="border rounded-lg p-4 space-y-4">
          {['shared', 'semi_private', 'private'].map(planType => {
            const plan = formData.pricingPlans?.find((p: any) => p.plan_type === planType) || {};
            const isEnabled = formData.enabledPlans?.includes(planType) || false;
            
            return (
              <div key={planType} className="border rounded p-3 space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`enable-${planType}`}
                    checked={isEnabled}
                    onCheckedChange={(checked) => {
                      const currentEnabled = formData.enabledPlans || [];
                      if (checked) {
                        handleInputChange('enabledPlans', [...currentEnabled, planType]);
                      } else {
                        handleInputChange('enabledPlans', currentEnabled.filter((p: string) => p !== planType));
                      }
                    }}
                  />
                  <Label htmlFor={`enable-${planType}`} className="capitalize font-medium">
                    {planType.replace('_', '-')} Plan
                  </Label>
                </div>
                
                {isEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-6">
                    <div>
                      <Label htmlFor={`${planType}-monthly`}>Monthly Price</Label>
                      <Input
                        id={`${planType}-monthly`}
                        value={plan.monthly_price || ''}
                        onChange={(e) => {
                          const currentPlans = formData.pricingPlans || [];
                          const planIndex = currentPlans.findIndex((p: any) => p.plan_type === planType);
                          let updatedPlans;
                          
                          if (planIndex >= 0) {
                            updatedPlans = [...currentPlans];
                            updatedPlans[planIndex] = { ...updatedPlans[planIndex], monthly_price: e.target.value };
                          } else {
                            updatedPlans = [...currentPlans, { plan_type: planType, monthly_price: e.target.value, yearly_price: '' }];
                          }
                          
                          handleInputChange('pricingPlans', updatedPlans);
                        }}
                        placeholder="NGN 500"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${planType}-yearly`}>Yearly Price</Label>
                      <Input
                        id={`${planType}-yearly`}
                        value={plan.yearly_price || ''}
                        onChange={(e) => {
                          const currentPlans = formData.pricingPlans || [];
                          const planIndex = currentPlans.findIndex((p: any) => p.plan_type === planType);
                          let updatedPlans;
                          
                          if (planIndex >= 0) {
                            updatedPlans = [...currentPlans];
                            updatedPlans[planIndex] = { ...updatedPlans[planIndex], yearly_price: e.target.value };
                          } else {
                            updatedPlans = [...currentPlans, { plan_type: planType, monthly_price: '', yearly_price: e.target.value }];
                          }
                          
                          handleInputChange('pricingPlans', updatedPlans);
                        }}
                        placeholder="NGN 5000"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <Label htmlFor="main_image_url">Main Image URL</Label>
        <Input
          id="main_image_url"
          value={formData.main_image_url || ''}
          onChange={(e) => handleInputChange('main_image_url', e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div>
        <Label htmlFor="video_url">Video URL (Optional)</Label>
        <Input
          id="video_url"
          value={formData.video_url || ''}
          onChange={(e) => handleInputChange('video_url', e.target.value)}
          placeholder="YouTube, Vimeo, or direct video URL"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Supports YouTube, Vimeo, or direct video file URLs
        </p>
      </div>
      <div>
        <Label htmlFor="video_thumbnail_url">Video Thumbnail URL (Optional)</Label>
        <Input
          id="video_thumbnail_url"
          value={formData.video_thumbnail_url || ''}
          onChange={(e) => handleInputChange('video_thumbnail_url', e.target.value)}
          placeholder="Custom thumbnail URL (optional)"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Custom thumbnail for the video (will use platform default if not provided)
        </p>
      </div>
      <div>
        <Label htmlFor="description">Short Description *</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Brief product description"
          className="min-h-[80px]"
        />
      </div>
      <div>
        <Label htmlFor="detailed_description">Detailed Description</Label>
        <Textarea
          id="detailed_description"
          value={formData.detailed_description || ''}
          onChange={(e) => handleInputChange('detailed_description', e.target.value)}
          placeholder="Detailed product description"
          className="min-h-[120px]"
        />
      </div>
      <div>
        <Label>Features</Label>
        <div className="space-y-2">
          {(formData.features || ['']).map((feature: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder="Enter feature"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeFeature(index)}
                disabled={(formData.features || []).length === 1}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addFeature}>
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>
      </div>
      <div>
        <Label>Product Images (Gallery URLs)</Label>
        <div className="space-y-2">
          {imageUrls.map((url, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={url}
                onChange={e => handleImageUrlChange(idx, e.target.value)}
                placeholder="Enter image URL"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeImageUrl(idx)}
                disabled={imageUrls.length === 1}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addImageUrl}>
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        </div>
      </div>
      {/* Video functionality temporarily disabled until product_videos table is available in types */}
      <div className="opacity-50 pointer-events-none">
        <Label>Product Videos (Coming Soon)</Label>
        <div className="p-4 border rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground">Video functionality will be available once the database types are updated.</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={saveProduct} disabled={loading} className="flex-1 sm:flex-none">
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
        <Button variant="outline" onClick={() => setPreviewProduct(formData)} className="flex-1 sm:flex-none">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button variant="outline" onClick={resetForm} className="flex-1 sm:flex-none">
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  
  // Add debugging
  console.log('Admin component render:', { user, isAdmin, isLoading });
  
  // Show loading state
  if (isLoading) {
    console.log('Admin: Showing loading state');
    return <AdminLogin />;
  }
  
  // Show login if not admin (allow temporary admin without user)
  if (!isAdmin) {
    console.log('Admin: User is not admin, showing login');
    return <AdminLogin />;
  }
  
  console.log('Admin: User is admin, showing AdminPanel');

  return (
    <AdminAuthGuard>
      <AdminPanel />
    </AdminAuthGuard>
  );
}

function AdminPanel() {
  const { products, loading, addProduct, updateProduct, deleteProduct: removeProduct } = useProducts();
  const { testimonials, loading: testimonialsLoading, addTestimonial, updateTestimonial, deleteTestimonial } = useTestimonials();
  
  // Debug logging (development only)
  if (import.meta.env.DEV) {
    console.log('AdminPanel render:', { products: products?.length, loading, testimonials: testimonials?.length, testimonialsLoading });
  }
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingTestimonial, setIsEditingTestimonial] = useState(false);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('products');
  const { toast } = useToast();
  const { signOut } = useAuth();
  
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    price: '',
    original_price: '',
    main_image_url: '',
    video_url: '',
    video_thumbnail_url: '',
    category: '',
    rating: 4.5,
    features: [''],
    detailed_description: '',
    enabledPlans: [],
    pricingPlans: [],
  });

  const [testimonialFormData, setTestimonialFormData] = useState<TestimonialFormData>({
    name: '',
    role: '',
    company: '',
    rating: 5,
    content: '',
    type: 'text',
    videoUrl: '',
    imageUrl: '',
    productSlug: '',
    verified: true,
    testimonialContentPhotoUrl: '',
    testimonialContentPhotoPath: '',
  });

  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const { images, refetch: refetchImages } = useProductImages(selectedProduct?.id);

  useEffect(() => {
    if (isEditing && selectedProduct?.id) {
      refetchImages().then(() => {
        setImageUrls(images.map(img => img.image_url));
      });
    } else if (isAdding) {
      setVideoUrls([]);
      setImageUrls([]);
    }
  }, [isEditing, isAdding, selectedProduct?.id]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTestimonialInputChange = (field: keyof TestimonialFormData, value: any) => {
    setTestimonialFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...(prev.features || []), ''] }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      features: (prev.features || []).filter((_, i) => i !== index) 
    }));
  };

  const savePricingPlans = async (productId: string) => {
    try {
      // Log admin action (optional - don't fail if it doesn't work)
      try {
        await supabase.rpc('log_admin_action', {
          _action: 'update_pricing_plans',
          _table_name: 'pricing_plans',
          _record_id: productId
        });
      } catch (error) {
        console.warn('Failed to log admin action:', error);
      }

      // Remove existing pricing plans for this product
      await supabase.from('pricing_plans').delete().eq('product_id', productId);
      
      // Add new pricing plans
      const enabledPlans = formData.enabledPlans || [];
      const pricingPlans = formData.pricingPlans || [];
      
      for (const planType of enabledPlans) {
        const plan = pricingPlans.find((p: any) => p.plan_type === planType);
        if (plan && (plan.monthly_price || plan.yearly_price)) {
          await supabase.from('pricing_plans').insert({
            product_id: productId,
            plan_type: planType,
            monthly_price: plan.monthly_price || null,
            yearly_price: plan.yearly_price || null,
            is_enabled: true
          });
        }
      }
    } catch (error) {
      console.error('Error saving pricing plans:', error);
      throw error;
    }
  };

  const startEdit = async (product: Product) => {
    // Open the dialog immediately for better UX
    setIsEditing(true);
    setSelectedProduct(product);
    
    try {
      // Fetch pricing plans for this product
      const { data: pricingPlans } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('product_id', product.id);
      
      const enabledPlans = (pricingPlans || []).map(p => p.plan_type);
      
      setFormData({
        name: product.name,
        description: product.description,
        detailed_description: product.detailed_description,
        price: product.price,
        original_price: product.original_price,
        category: product.category,
        rating: product.rating,
        features: [...product.features],
        main_image_url: product.main_image_url,
        video_url: (product as any).video_url || '',
        video_thumbnail_url: (product as any).video_thumbnail_url || '',
        enabledPlans,
        pricingPlans: pricingPlans || [],
      });
    } catch (e) {
      // If fetching plans fails, still allow editing base product fields
      setFormData({
        name: product.name,
        description: product.description,
        detailed_description: product.detailed_description,
        price: product.price,
        original_price: product.original_price,
        category: product.category,
        rating: product.rating,
        features: [...product.features],
        main_image_url: product.main_image_url,
        video_url: (product as any).video_url || '',
        video_thumbnail_url: (product as any).video_thumbnail_url || '',
        enabledPlans: [],
        pricingPlans: [],
      });
      console.warn('Failed to fetch pricing plans for product edit; continuing without plans.', e);
    }
    // Don't change activeTab - we're using a dialog now
  };

  const startAdd = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      main_image_url: '',
      video_url: '',
      video_thumbnail_url: '',
      category: '',
      rating: 4.5,
      features: [''],
      detailed_description: '',
      enabledPlans: [],
      pricingPlans: [],
    });
    setIsAdding(true);
    // Don't change activeTab - we're using a dialog now
  };

  const saveProduct = async () => {
    try {
      // Validate input data
      const validation = validateProductData(formData);
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join(', '),
          variant: "destructive"
        });
        return;
      }

      // Sanitize input data
      const sanitizedData = sanitizeProductData(formData);
      
      const cleanFeatures = (sanitizedData.features || []).filter(f => f.trim() !== '');
      
      const productData = {
        name: sanitizedData.name,
        description: sanitizedData.description,
        detailed_description: sanitizedData.detailed_description || null,
        price: sanitizedData.original_price, // Use original_price as price
        original_price: sanitizedData.original_price,
        category: sanitizedData.category,
        rating: sanitizedData.rating !== '' && sanitizedData.rating !== undefined ? Number(sanitizedData.rating) : null,
        features: cleanFeatures.length > 0 ? cleanFeatures : null,
        main_image_url: sanitizedData.main_image_url || null,
        video_url: sanitizedData.video_url || null,
        video_thumbnail_url: sanitizedData.video_thumbnail_url || null,
      };

      if (import.meta.env.DEV) {
        console.log('Saving product with data:', { isEditing, isAdding, productData, selectedProduct: selectedProduct?.id });
        console.log('Video fields in formData:', { 
          video_url: formData.video_url, 
          video_thumbnail_url: formData.video_thumbnail_url 
        });
        console.log('Video fields in sanitizedData:', { 
          video_url: sanitizedData.video_url, 
          video_thumbnail_url: sanitizedData.video_thumbnail_url 
        });
        console.log('Video fields in productData:', { 
          video_url: productData.video_url, 
          video_thumbnail_url: productData.video_thumbnail_url 
        });
      }

      if (isEditing && selectedProduct) {
        // Verify product exists before updating
        const { data: existingProduct, error: fetchError } = await supabase
          .from('products')
          .select('id')
          .eq('id', selectedProduct.id)
          .single();

        if (fetchError || !existingProduct) {
          toast({
            title: "Product Not Found",
            description: "The product you're trying to edit no longer exists. Please refresh the page.",
            variant: "destructive"
          });
          return;
        }

        // Log admin action (optional - don't fail if it doesn't work)
        try {
          await supabase.rpc('log_admin_action', {
            _action: 'update_product',
            _table_name: 'products',
            _record_id: selectedProduct.id,
            _new_values: productData
          });
        } catch (error) {
          console.warn('Failed to log admin action:', error);
        }

        console.log('About to update product with data:', productData);
        try {
          const updatedProduct = await updateProduct(selectedProduct.id, productData);
          console.log('Product updated successfully:', updatedProduct);
        } catch (updateError) {
          console.error('Error updating product:', updateError);
          toast({
            title: "Update Error",
            description: `Failed to update product: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`,
            variant: "destructive"
          });
          return;
        }
        await savePricingPlans(selectedProduct.id);
        
        // Handle product images
        await supabase.from('product_images').delete().eq('product_id', selectedProduct.id);
        for (const url of imageUrls) {
          if (url.trim()) {
            await supabase.from('product_images').insert({ 
              product_id: selectedProduct.id, 
              image_url: url.trim(), 
              display_order: 0 
            });
          }
        }
        
        toast({
          title: "Product updated",
          description: "Product has been successfully updated"
        });
      } else if (isAdding) {
        const newProductData = await addProduct(productData);
        const productId = newProductData.id;
        
        // Log admin action (optional - don't fail if it doesn't work)
        try {
          await supabase.rpc('log_admin_action', {
            _action: 'create_product',
            _table_name: 'products',
            _record_id: productId,
            _new_values: productData
          });
        } catch (error) {
          console.warn('Failed to log admin action:', error);
        }
        
        await savePricingPlans(productId);
        
        // Handle product images
        for (const url of imageUrls) {
          if (url.trim()) {
            await supabase.from('product_images').insert({ 
              product_id: productId, 
              image_url: url.trim(), 
              display_order: 0 
            });
          }
        }

        toast({
          title: "Product created",
          description: "New product has been successfully created"
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        // Log admin action (optional - don't fail if it doesn't work)
        try {
          await supabase.rpc('log_admin_action', {
            _action: 'delete_product',
            _table_name: 'products',
            _record_id: productId
          });
        } catch (error) {
          console.warn('Failed to log admin action:', error);
        }

        await removeProduct(productId);
        toast({
          title: "Product deleted",
          description: "Product has been successfully deleted"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete product",
          variant: "destructive"
        });
      }
    }
  };

  // Testimonial management functions
  const startEditTestimonial = (testimonial: any) => {
    setSelectedTestimonial(testimonial);
    setTestimonialFormData({
      name: testimonial.name,
      role: testimonial.role,
      company: testimonial.company || '',
      rating: testimonial.rating,
      content: testimonial.content,
      type: testimonial.type,
      videoUrl: testimonial.video_url || '',
      imageUrl: testimonial.image_url || '',
      productSlug: testimonial.product_slug,
      verified: testimonial.verified,
      testimonialContentPhotoUrl: testimonial.testimonial_content_photo_url || '',
      testimonialContentPhotoPath: testimonial.testimonial_content_photo_path || '',
    });
    setIsEditingTestimonial(true);
    setActiveTab('testimonials');
  };

  const startAddTestimonial = () => {
    setTestimonialFormData({
      name: '',
      role: '',
      company: '',
      rating: 5,
      content: '',
      type: 'text',
      videoUrl: '',
      imageUrl: '',
      productSlug: '',
      verified: true,
      testimonialContentPhotoUrl: '',
      testimonialContentPhotoPath: '',
    });
    setIsAddingTestimonial(true);
    setActiveTab('testimonials');
  };

  const saveTestimonial = async () => {
    try {
      if (!testimonialFormData.name || !testimonialFormData.role || !testimonialFormData.content || !testimonialFormData.productSlug) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      if (isEditingTestimonial && selectedTestimonial) {
        await updateTestimonial(selectedTestimonial.id, testimonialFormData);
        toast({
          title: "Testimonial updated",
          description: "Testimonial has been successfully updated"
        });
      } else if (isAddingTestimonial) {
        await addTestimonial(testimonialFormData);
        toast({
          title: "Testimonial created",
          description: "New testimonial has been successfully created"
        });
      }
      resetTestimonialForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save testimonial",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await deleteTestimonial(testimonialId);
        toast({
          title: "Testimonial deleted",
          description: "Testimonial has been successfully deleted"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete testimonial",
          variant: "destructive"
        });
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setIsAdding(false);
    setSelectedProduct(null);
    setPreviewProduct(null);
    // Don't change activeTab when closing dialog - stay on current tab
    // setActiveTab('products');
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      main_image_url: '',
      video_url: '',
      video_thumbnail_url: '',
      category: '',
      rating: 4.5,
      features: [''],
      detailed_description: '',
      enabledPlans: [],
      pricingPlans: [],
    });
    setVideoUrls([]);
    setImageUrls([]);
  };

  const resetTestimonialForm = () => {
    setIsEditingTestimonial(false);
    setIsAddingTestimonial(false);
    setSelectedTestimonial(null);
    setActiveTab('testimonials');
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={startAdd} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
          <Button onClick={startAddTestimonial} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
          <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex w-max min-w-full h-auto p-1 bg-muted rounded-md">
              <TabsTrigger value="products" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">Products ({products.length})</TabsTrigger>
              <TabsTrigger value="testimonials" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">Testimonials ({testimonials.length})</TabsTrigger>
              <TabsTrigger value="subscriptions" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">Subscriptions</TabsTrigger>
              <TabsTrigger value="product-codes" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">Product Codes</TabsTrigger>
              <TabsTrigger value="refund-requests" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">Refund Requests</TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="products" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first product</p>
                <Button onClick={startAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        {product.main_image_url && (
                          <img
                            src={product.main_image_url}
                            alt={product.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
                            {product.description}
                          </p>
                          <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                            <Badge className="text-xs">{product.category}</Badge>
                            <Badge variant="outline" className="text-xs">{product.price}</Badge>
                            <Badge variant="secondary" className="text-xs">★ {product.rating}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 sm:gap-2 shrink-0 justify-end sm:justify-start">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(product)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/product/${product.slug}`, '_blank')}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4">
          <TestimonialManager />
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <SubscriptionAdmin />
        </TabsContent>

        <TabsContent value="product-codes" className="space-y-4">
          <div className="space-y-6">
            <TestProductCodeGeneration />
            <ProductCodeAdmin />
          </div>
        </TabsContent>

        <TabsContent value="refund-requests" className="space-y-4">
          <RefundRequestsAdmin />
        </TabsContent>

      </Tabs>

      {/* Product Form Dialog */}
      <Dialog open={isAdding || isEditing} onOpenChange={(open) => {
        if (!open) {
          // Only reset when closing (open is false)
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle>{isAdding ? 'Add New Product' : 'Edit Product'}</DialogTitle>
            <DialogDescription>
              {isAdding ? 'Fill in the details to add a new product to your store' : 'Update the product information below'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleFeatureChange={handleFeatureChange}
            addFeature={addFeature}
            removeFeature={removeFeature}
            isEditing={isEditing}
            isAdding={isAdding}
            saveProduct={saveProduct}
            loading={loading}
            setPreviewProduct={setPreviewProduct}
            resetForm={() => {
              resetForm();
            }}
            categories={categories}
            videoUrls={videoUrls}
            setVideoUrls={setVideoUrls}
            imageUrls={imageUrls}
            setImageUrls={setImageUrls}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewProduct} onOpenChange={() => setPreviewProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle>Product Preview</DialogTitle>
            <DialogDescription>
              Preview how your product will appear to customers
            </DialogDescription>
          </DialogHeader>
          {previewProduct && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {previewProduct.main_image_url && (
                  <img
                    src={previewProduct.main_image_url}
                    alt={previewProduct.name}
                    className="w-full sm:w-32 h-32 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold">{previewProduct.name}</h2>
                  <p className="text-muted-foreground text-sm sm:text-base">{previewProduct.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge>{previewProduct.category}</Badge>
                    <Badge variant="outline">Rating: {previewProduct.rating}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xl sm:text-2xl font-bold text-primary">{previewProduct.price}</span>
                    <span className="text-base sm:text-lg text-muted-foreground line-through">{previewProduct.original_price}</span>
                  </div>
                </div>
              </div>
              
              {previewProduct.detailed_description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{previewProduct.detailed_description}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="list-disc list-inside space-y-1">
                  {previewProduct.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Product Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {imageUrls.map((url, idx) => (
                    <img key={idx} src={url} alt={`Product Image ${idx + 1}`} className="w-full h-20 sm:h-24 object-cover rounded" />
                  ))}
                </div>
              </div>

              <div className="opacity-50">
                <h3 className="font-semibold mb-2">Product Videos (Coming Soon)</h3>
                <p className="text-sm text-muted-foreground">Video functionality will be available once the database types are updated.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
