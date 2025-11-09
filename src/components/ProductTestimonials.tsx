import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, Eye } from 'lucide-react';
import { useProductTestimonials } from '@/hooks/useProductTestimonials';
import { useNavigate } from 'react-router-dom';

interface ProductTestimonialsProps {
  productSlug: string;
  productName: string;
}

export const ProductTestimonials = ({ productSlug, productName }: ProductTestimonialsProps) => {
  const { testimonials, loading } = useProductTestimonials(productSlug);
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const displayedTestimonials = showAll ? testimonials : testimonials.slice(0, 3);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading testimonials...</div>
        </CardContent>
      </Card>
    );
  }

  if (testimonials.length === 0) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">
              No reviews yet. Be the first to share your experience!
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/product/${productSlug}`)}
            >
              View Product
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Customer Reviews ({testimonials.length})
          </CardTitle>
          {testimonials.length > 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/testimonials/${productSlug}`)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedTestimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                {(testimonial as any).customer_photo_url ? (
                  <img
                    src={(testimonial as any).customer_photo_url}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className={`w-10 h-10 bg-gradient-to-r ${getGradientClass(index)} rounded-full flex items-center justify-center text-white font-semibold`}>
                    {getInitials(testimonial.name)}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                    {testimonial.verified && (
                      <span className="text-sm text-muted-foreground ml-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {testimonial.type === 'image' && (testimonial as any).testimonial_content_photo_url ? (
                <div className="mb-2">
                  <img
                    src={(testimonial as any).testimonial_content_photo_url}
                    alt="Testimonial content"
                    className="w-full max-w-xs rounded-lg border"
                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-2">
                  "{testimonial.content}"
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {testimonial.role && <span>{testimonial.role}</span>}
                  {testimonial.company && <span>at {testimonial.company}</span>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(testimonial.date)}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {testimonials.length > 3 && !showAll && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => setShowAll(true)}
            >
              Show More Reviews ({testimonials.length - 3} more)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
