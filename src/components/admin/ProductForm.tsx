import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  Upload,
  Video,
  Image,
  Star,
  DollarSign,
  Tag,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeProductData, validateProductData } from '@/utils/validation';

interface Product {
  id: string;
  name: string;
  description: string;
  detailed_description?: string;
  price: number;
  original_price?: number;
  category: string;
  rating?: number;
  features?: string[];
  main_image_url?: string;
  video_url?: string;
  video_thumbnail_url?: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface ProductFormProps {
  selectedProduct: Product | null;
  isEditing: boolean;
  isAdding: boolean;
  onSave: (productData: any) => Promise<void>;
  onCancel: () => void;
  onPreview: (product: Product) => void;
}

export const ProductForm = ({ 
  selectedProduct, 
  isEditing, 
  isAdding, 
  onSave, 
  onCancel, 
  onPreview 
}: ProductFormProps) => {
  const { toast } = useToast();
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && selectedProduct) {
      setFormData({
        name: selectedProduct.name || '',
        description: selectedProduct.description || '',
        price: selectedProduct.price?.toString() || '',
        original_price: selectedProduct.original_price?.toString() || '',
        main_image_url: selectedProduct.main_image_url || '',
        video_url: selectedProduct.video_url || '',
        video_thumbnail_url: selectedProduct.video_thumbnail_url || '',
        category: selectedProduct.category || '',
        rating: selectedProduct.rating || 4.5,
        features: selectedProduct.features || [''],
        detailed_description: selectedProduct.detailed_description || '',
        enabledPlans: [],
        pricingPlans: [],
      });
    } else if (isAdding) {
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
    }
  }, [isEditing, isAdding, selectedProduct]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ 
      ...prev, 
      features: [...(prev.features || []), ''] 
    }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_: any, i: number) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Product Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category *
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g., ai-tools, design, productivity"
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price (PKR) *
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Enter price"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="original_price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Original Price (PKR)
              </Label>
              <Input
                id="original_price"
                type="number"
                value={formData.original_price}
                onChange={(e) => handleInputChange('original_price', e.target.value)}
                placeholder="Enter original price"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Rating
            </Label>
            <Input
              id="rating"
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={formData.rating}
              onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
              placeholder="Enter rating (1-5)"
            />
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Short Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter short description"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detailed_description" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Detailed Description
              </Label>
              <Textarea
                id="detailed_description"
                value={formData.detailed_description}
                onChange={(e) => handleInputChange('detailed_description', e.target.value)}
                placeholder="Enter detailed description"
                rows={4}
              />
            </div>
          </div>

          {/* Media URLs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="main_image_url" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Main Image URL
              </Label>
              <Input
                id="main_image_url"
                value={formData.main_image_url}
                onChange={(e) => handleInputChange('main_image_url', e.target.value)}
                placeholder="Enter main image URL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Video URL
              </Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) => handleInputChange('video_url', e.target.value)}
                placeholder="Enter video URL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_thumbnail_url" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Video Thumbnail URL
              </Label>
              <Input
                id="video_thumbnail_url"
                value={formData.video_thumbnail_url}
                onChange={(e) => handleInputChange('video_thumbnail_url', e.target.value)}
                placeholder="Enter video thumbnail URL"
              />
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Features</Label>
              <Button type="button" onClick={addFeature} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Feature
              </Button>
            </div>
            
            {formData.features?.map((feature: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder={`Feature ${index + 1}`}
                />
                <Button
                  type="button"
                  onClick={() => removeFeature(index)}
                  size="sm"
                  variant="outline"
                  disabled={formData.features.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            {isEditing && selectedProduct && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onPreview(selectedProduct)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            )}
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Product' : 'Create Product'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
