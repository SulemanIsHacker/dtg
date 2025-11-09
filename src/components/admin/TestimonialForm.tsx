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
  Star,
  User,
  Building,
  MessageSquare,
  Image,
  Video,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestimonialFormData {
  name: string;
  role: string;
  company: string;
  rating: number;
  content: string;
  type: 'text' | 'video' | 'image';
  videoUrl: string;
  imageUrl: string;
  productSlug: string;
  verified: boolean;
  testimonialContentPhotoUrl: string;
  testimonialContentPhotoPath: string;
}

interface TestimonialFormProps {
  selectedTestimonial: any;
  isEditing: boolean;
  isAdding: boolean;
  onSave: (testimonialData: TestimonialFormData) => Promise<void>;
  onCancel: () => void;
}

export const TestimonialForm = ({ 
  selectedTestimonial, 
  isEditing, 
  isAdding, 
  onSave, 
  onCancel 
}: TestimonialFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<TestimonialFormData>({
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && selectedTestimonial) {
      setFormData({
        name: selectedTestimonial.name || '',
        role: selectedTestimonial.role || '',
        company: selectedTestimonial.company || '',
        rating: selectedTestimonial.rating || 5,
        content: selectedTestimonial.content || '',
        type: selectedTestimonial.type || 'text',
        videoUrl: selectedTestimonial.videoUrl || '',
        imageUrl: selectedTestimonial.imageUrl || '',
        productSlug: selectedTestimonial.productSlug || '',
        verified: selectedTestimonial.verified ?? true,
        testimonialContentPhotoUrl: selectedTestimonial.testimonialContentPhotoUrl || '',
        testimonialContentPhotoPath: selectedTestimonial.testimonialContentPhotoPath || '',
      });
    } else if (isAdding) {
      setFormData({
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
    }
  }, [isEditing, isAdding, selectedTestimonial]);

  const handleInputChange = (field: keyof TestimonialFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          {isEditing ? 'Edit Testimonial' : 'Add New Testimonial'}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Role
              </Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="e.g., CEO, Designer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Company
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Rating *
            </Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleInputChange('rating', star)}
                  className={`p-1 rounded ${
                    star <= formData.rating 
                      ? 'text-yellow-400' 
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                >
                  <Star className={`w-6 h-6 ${star <= formData.rating ? 'fill-current' : ''}`} />
                </button>
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                {formData.rating} star{formData.rating !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Testimonial Content *
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Enter the testimonial content"
              rows={4}
              required
            />
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Testimonial Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="text"
                  checked={formData.type === 'text'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                />
                <MessageSquare className="w-4 h-4" />
                Text
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="video"
                  checked={formData.type === 'video'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                />
                <Video className="w-4 h-4" />
                Video
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="image"
                  checked={formData.type === 'image'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                />
                <Image className="w-4 h-4" />
                Image
              </label>
            </div>
          </div>

          {/* Media URLs */}
          {formData.type === 'video' && (
            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Video URL
              </Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                placeholder="Enter video URL"
              />
            </div>
          )}

          {formData.type === 'image' && (
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Image URL
              </Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="Enter image URL"
              />
            </div>
          )}

          {/* Product Slug */}
          <div className="space-y-2">
            <Label htmlFor="productSlug" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Product Slug
            </Label>
            <Input
              id="productSlug"
              value={formData.productSlug}
              onChange={(e) => handleInputChange('productSlug', e.target.value)}
              placeholder="Enter product slug (optional)"
            />
          </div>

          {/* Verification */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="verified"
              checked={formData.verified}
              onChange={(e) => handleInputChange('verified', e.target.checked)}
            />
            <Label htmlFor="verified" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Verified Testimonial
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Testimonial' : 'Create Testimonial'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
