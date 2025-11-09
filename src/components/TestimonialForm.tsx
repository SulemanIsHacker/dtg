import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Save, X, Eye, FileText, Video, Image as ImageIcon } from 'lucide-react';
import { TestimonialFormData } from '@/hooks/useTestimonials';
import { useProducts } from '@/hooks/useProducts';

interface TestimonialFormProps {
  formData: TestimonialFormData;
  handleInputChange: (field: keyof TestimonialFormData, value: any) => void;
  isEditing: boolean;
  isAdding: boolean;
  saveTestimonial: () => void;
  loading: boolean;
  resetForm: () => void;
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({
  formData,
  handleInputChange,
  isEditing,
  isAdding,
  saveTestimonial,
  loading,
  resetForm
}) => {
  const [previewMode, setPreviewMode] = useState(false);
  const { products } = useProducts();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 cursor-pointer ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
        onClick={() => handleInputChange('rating', i + 1)}
      />
    ));
  };

  const getProductName = (slug: string) => {
    const product = products.find(tool => tool.name.toLowerCase().replace(/\s+/g, '-') === slug);
    return product ? product.name : slug;
  };

  const productSlugs = products.map(tool => ({
    value: tool.name.toLowerCase().replace(/\s+/g, '-'),
    label: tool.name
  }));

  if (previewMode) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Preview</h3>
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <X className="h-4 w-4 mr-2" />
            Close Preview
          </Button>
        </div>
        
        <Card className="relative hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {formData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{formData.name}</h3>
                    {formData.verified && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{formData.role}</p>
                  {formData.company && (
                    <p className="text-xs text-muted-foreground">{formData.company}</p>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center gap-1">
              {renderStars(formData.rating)}
            </div>
            
            {/* Content based on type */}
            {formData.type === "text" && (
              <p className="text-sm leading-relaxed">{formData.content}</p>
            )}
            
            {formData.type === "image" && formData.imageUrl && (
              <div className="space-y-3">
                <img 
                  src={formData.imageUrl} 
                  alt="Testimonial"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <p className="text-sm leading-relaxed">{formData.content}</p>
              </div>
            )}
            
            {formData.type === "video" && formData.videoUrl && (
              <div className="space-y-3">
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={formData.videoUrl}
                    className="w-full h-full"
                    title="Testimonial Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-sm leading-relaxed">{formData.content}</p>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t">
              <Badge variant="outline" className="text-xs">
                {formData.type === "text" && <FileText className="w-3 h-3 mr-1" />}
                {formData.type === "video" && <Video className="w-3 h-3 mr-1" />}
                {formData.type === "image" && <ImageIcon className="w-3 h-3 mr-1" />}
                {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getProductName(formData.productSlug)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Customer Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter customer name"
            maxLength={100}
          />
        </div>
        <div>
          <Label htmlFor="role">Role/Position *</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            placeholder="e.g., Content Creator, SEO Specialist"
            maxLength={100}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company">Company (Optional)</Label>
          <Input
            id="company"
            value={formData.company || ''}
            onChange={(e) => handleInputChange('company', e.target.value)}
            placeholder="e.g., Digital Marketing Pro"
            maxLength={100}
          />
        </div>
        <div>
          <Label htmlFor="productSlug">Product *</Label>
          <Select value={formData.productSlug} onValueChange={(value) => handleInputChange('productSlug', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {productSlugs.map(product => (
                <SelectItem key={product.value} value={product.value}>
                  {product.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label>Rating *</Label>
          <div className="flex items-center gap-2 mt-2">
            {renderStars(formData.rating)}
            <span className="text-sm font-medium ml-2">{formData.rating}/5</span>
          </div>
        </div>
        <div>
          <Label>Testimonial Type *</Label>
          <Select value={formData.type} onValueChange={(value: 'text' | 'video' | 'image') => handleInputChange('type', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Text Review
                </div>
              </SelectItem>
              <SelectItem value="video">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video Review
                </div>
              </SelectItem>
              <SelectItem value="image">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Image Review
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="content">Testimonial Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          placeholder="Write the customer's testimonial..."
          className="min-h-[120px]"
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.content.length}/1000 characters
        </p>
      </div>

      {formData.type === "video" && (
        <div>
          <Label htmlFor="videoUrl">Video URL *</Label>
          <Input
            id="videoUrl"
            value={formData.videoUrl || ''}
            onChange={(e) => handleInputChange('videoUrl', e.target.value)}
            placeholder="https://www.youtube.com/embed/VIDEO_ID"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use YouTube embed URL format: https://www.youtube.com/embed/VIDEO_ID
          </p>
        </div>
      )}

      {formData.type === "image" && (
        <div>
          <Label htmlFor="imageUrl">Image URL *</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl || ''}
            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Provide a direct link to the image
          </p>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="verified"
          checked={formData.verified}
          onCheckedChange={(checked) => handleInputChange('verified', checked)}
        />
        <Label htmlFor="verified">Verified Customer</Label>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={saveTestimonial} disabled={loading} className="flex-1 sm:flex-none">
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Update Testimonial' : 'Create Testimonial'}
        </Button>
        <Button variant="outline" onClick={() => setPreviewMode(true)} className="flex-1 sm:flex-none">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button variant="outline" onClick={resetForm} className="flex-1 sm:flex-none">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default TestimonialForm;
