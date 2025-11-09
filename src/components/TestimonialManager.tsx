import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, Star, CheckCircle, XCircle, Upload, X } from 'lucide-react';
import { useTestimonials, TestimonialFormData } from '@/hooks/useTestimonials';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { supabase } from '@/integrations/supabase/client';

interface TestimonialManagerProps {
  onClose?: () => void;
}

export const TestimonialManager = ({ onClose }: TestimonialManagerProps) => {
  const { testimonials, loading, addTestimonial, updateTestimonial, deleteTestimonial, refetch } = useTestimonials();
  const { products } = useProducts();
  const { toast } = useToast();
  const { uploadFile, deleteFile } = useSupabaseStorage();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [customerPhoto, setCustomerPhoto] = useState<File | null>(null);
  const [customerPhotoPreview, setCustomerPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    testimonialContentPhotoPath: ''
  });

  const handleInputChange = (field: keyof TestimonialFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear content when switching to image type
      if (field === 'type' && value === 'image') {
        newData.content = '';
      }
      
      // Clear photo when switching to text type
      if (field === 'type' && value === 'text') {
        newData.testimonialContentPhotoUrl = '';
        newData.testimonialContentPhotoPath = '';
        setCustomerPhoto(null);
        setCustomerPhotoPreview('');
      }
      
      return newData;
    });
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    setUploadingPhoto(true);
    setCustomerPhoto(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomerPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    try {
      const result = await uploadFile(file, 'testimonials', 'customer-photos');
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          testimonialContentPhotoUrl: result.url,
          testimonialContentPhotoPath: result.path
        }));
        toast({
          title: "Photo uploaded",
          description: "Testimonial photo uploaded successfully"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload photo",
        variant: "destructive"
      });
      setCustomerPhoto(null);
      setCustomerPhotoPreview('');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoRemove = async () => {
    if (formData.testimonialContentPhotoPath) {
      try {
        await deleteFile('testimonials', formData.testimonialContentPhotoPath);
      } catch (error) {
        console.error('Failed to delete photo from storage:', error);
      }
    }
    
    setCustomerPhoto(null);
    setCustomerPhotoPreview('');
    setFormData(prev => ({
      ...prev,
      testimonialContentPhotoUrl: '',
      testimonialContentPhotoPath: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.role || !formData.productSlug) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Role, Product)",
        variant: "destructive",
      });
      return;
    }

    // Validate content based on type
    if (formData.type === 'text' && !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please enter testimonial content for text testimonials",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === 'image' && !formData.testimonialContentPhotoUrl) {
      toast({
        title: "Validation Error",
        description: "Please upload a photo for photo testimonials",
        variant: "destructive",
      });
      return;
    }
    
    // Validate rating
    if (formData.rating < 1 || formData.rating > 5) {
      toast({
        title: "Validation Error",
        description: "Rating must be between 1 and 5",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id, formData);
        toast({
          title: "Success",
          description: "Testimonial updated successfully!",
        });
        setEditingTestimonial(null);
      } else {
        await addTestimonial(formData);
        toast({
          title: "Success",
          description: "Testimonial added successfully!",
        });
      }
      
      resetForm();
      setIsAdding(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save testimonial",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
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
      testimonialContentPhotoPath: ''
    });
    setCustomerPhoto(null);
    setCustomerPhotoPreview('');
  };

  const handleEdit = (testimonial: any) => {
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      company: testimonial.company || '',
      rating: testimonial.rating,
      content: testimonial.content || '',
      type: testimonial.type,
      videoUrl: testimonial.video_url || '',
      imageUrl: testimonial.image_url || '',
      productSlug: testimonial.product_slug,
      verified: testimonial.verified,
      testimonialContentPhotoUrl: testimonial.testimonial_content_photo_url || '',
      testimonialContentPhotoPath: testimonial.testimonial_content_photo_path || ''
    });
    
    // Set photo preview if it's an image testimonial
    if (testimonial.type === 'image' && testimonial.testimonial_content_photo_url) {
      setCustomerPhotoPreview(testimonial.testimonial_content_photo_url);
    } else {
      setCustomerPhotoPreview('');
    }
    
    setEditingTestimonial(testimonial);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await deleteTestimonial(id);
        toast({
          title: "Success",
          description: "Testimonial deleted successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete testimonial",
          variant: "destructive",
        });
      }
    }
  };

  const getProductName = (slug: string) => {
    const product = products.find(p => p.slug === slug);
    return product ? product.name : slug;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      'from-blue-500 to-purple-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-purple-500 to-pink-500',
      'from-cyan-500 to-blue-500',
      'from-emerald-500 to-green-500'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Testimonial Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Customer Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role/Title</label>
                  <Input
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    placeholder="e.g., Business Owner, Designer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Company name (optional)"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Product *</label>
                  <Select value={formData.productSlug} onValueChange={(value) => handleInputChange('productSlug', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.slug}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Rating *</label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleInputChange('rating', rating)}
                      className={`p-1 ${formData.rating >= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Testimonial Type *</label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select testimonial type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Testimonial</SelectItem>
                    <SelectItem value="image">Photo Testimonial (Screenshot/Conversation)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose "Text" for written testimonials or "Photo" for screenshots of conversations, reviews, etc.
                </p>
              </div>

              {formData.type === 'text' ? (
                <div>
                  <label className="text-sm font-medium">Testimonial Content *</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Enter the customer's testimonial..."
                    rows={4}
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium">Testimonial Photo *</label>
                  <div className="mt-2 space-y-3">
                    {customerPhotoPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={customerPhotoPreview}
                          alt="Testimonial photo preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={handlePhotoRemove}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload testimonial photo</p>
                        <p className="text-xs text-gray-500 mb-3">
                          Screenshot of conversation, review, or testimonial content
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(file);
                          }}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                        >
                          {uploadingPhoto ? 'Uploading...' : 'Choose Photo'}
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Recommended: Screenshot of conversation, review, or testimonial. Max 5MB. JPG, PNG, or WebP formats.
                    </p>
                  </div>
                </div>
              )}


              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={formData.verified}
                    onChange={(e) => handleInputChange('verified', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="verified" className="text-sm font-medium">
                    Verified Purchase
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setIsAdding(false);
                  setEditingTestimonial(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Testimonials List */}
      <Card>
        <CardHeader>
          <CardTitle>All Testimonials ({testimonials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading testimonials...</div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No testimonials found. Add your first testimonial above.
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {(testimonial as any).customer_photo_url ? (
                        <img
                          src={(testimonial as any).customer_photo_url}
                          alt={testimonial.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className={`w-10 h-10 bg-gradient-to-r ${getGradientClass(index)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                          {getInitials(testimonial.name)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{testimonial.name}</h4>
                          {testimonial.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            for {getProductName(testimonial.product_slug)}
                          </span>
                        </div>
                        {testimonial.type === 'image' && (testimonial as any).testimonial_content_photo_url ? (
                          <div className="mb-2">
                            <img
                              src={(testimonial as any).testimonial_content_photo_url}
                              alt="Testimonial content"
                              className="w-32 h-32 rounded-lg border"
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mb-2">
                            "{testimonial.content.length > 150 ? testimonial.content.substring(0, 150) + '...' : testimonial.content}"
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {testimonial.role && <span>{testimonial.role}</span>}
                          {testimonial.company && <span>at {testimonial.company}</span>}
                          <span>{new Date(testimonial.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(testimonial)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(testimonial.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
