import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, ArrowLeft, Filter } from 'lucide-react';
import { useProductTestimonials } from '@/hooks/useProductTestimonials';
import { useProducts } from '@/hooks/useProducts';
import { Header } from '@/components/Header';
import { Seo } from '@/components/Seo';

export default function ProductTestimonialsPage() {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const { testimonials, loading } = useProductTestimonials(productSlug);
  const { products } = useProducts();
  
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');

  const product = products.find(p => p.slug === productSlug);

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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredTestimonials = testimonials
    .filter(testimonial => ratingFilter === null || testimonial.rating === ratingFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: testimonials.filter(t => t.rating === rating).length,
    percentage: testimonials.length > 0 
      ? (testimonials.filter(t => t.rating === rating).length / testimonials.length) * 100 
      : 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading testimonials...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo 
        title={`${product.name} - Customer Reviews & Testimonials`}
        description={`Read authentic customer reviews and testimonials for ${product.name}. See what our customers say about their experience.`}
        keywords={`${product.name} reviews, customer testimonials, user feedback, product reviews`}
        canonicalPath={`/testimonials/${productSlug}`}
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/product/${productSlug}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Product
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            {product.main_image_url && (
              <img 
                src={product.main_image_url} 
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{product.name} Reviews</h1>
              <p className="text-muted-foreground">Customer testimonials and feedback</p>
            </div>
          </div>
        </div>

        {testimonials.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Star className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-foreground">No Reviews Yet</h2>
                <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                  Be the first to share your experience with {product.name}!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate(`/product/${productSlug}`)}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    View Product
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => window.open('https://wa.me/2348141988239', '_blank')}
                  >
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Rating Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Rating Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Rating */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {averageRating}
                    </div>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < Math.round(parseFloat(averageRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on {testimonials.length} review{testimonials.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Rating Distribution */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Rating Breakdown</h4>
                    {ratingDistribution.map(({ rating, count, percentage }) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm w-8">{rating}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">{count}</span>
                      </div>
                    ))}
                  </div>

                  {/* Filters */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filter by Rating
                    </h4>
                    <div className="space-y-2">
                      <Button
                        variant={ratingFilter === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRatingFilter(null)}
                        className="w-full justify-start"
                      >
                        All Reviews ({testimonials.length})
                      </Button>
                      {[5, 4, 3, 2, 1].map(rating => {
                        const count = testimonials.filter(t => t.rating === rating).length;
                        if (count === 0) return null;
                        return (
                          <Button
                            key={rating}
                            variant={ratingFilter === rating ? "default" : "outline"}
                            size="sm"
                            onClick={() => setRatingFilter(rating)}
                            className="w-full justify-start"
                          >
                            {rating}★ ({count})
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Sort by</h4>
                    <div className="space-y-2">
                      {[
                        { value: 'newest', label: 'Newest First' },
                        { value: 'oldest', label: 'Oldest First' },
                        { value: 'rating', label: 'Highest Rating' }
                      ].map(option => (
                        <Button
                          key={option.value}
                          variant={sortBy === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSortBy(option.value as any)}
                          className="w-full justify-start"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Testimonials */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {filteredTestimonials.map((testimonial, index) => (
                  <Card key={testimonial.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {(testimonial as any).customer_photo_url ? (
                          <img
                            src={(testimonial as any).customer_photo_url}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className={`w-12 h-12 bg-gradient-to-r ${getGradientClass(index)} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}>
                            {getInitials(testimonial.name)}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                            {testimonial.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {testimonial.rating} out of 5 stars
                            </span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(testimonial.date)}
                            </span>
                          </div>

                          {testimonial.type === 'image' && (testimonial as any).testimonial_content_photo_url ? (
                            <div className="mb-4">
                              <img
                                src={(testimonial as any).testimonial_content_photo_url}
                                alt="Testimonial content"
                                className="w-full max-w-md rounded-lg border"
                                style={{ maxHeight: '400px', objectFit: 'contain' }}
                              />
                            </div>
                          ) : (
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                              "{testimonial.content}"
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {testimonial.role && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Role:</span>
                                {testimonial.role}
                              </span>
                            )}
                            {testimonial.company && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Company:</span>
                                {testimonial.company}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTestimonials.length === 0 && ratingFilter !== null && (
                <div className="max-w-xl mx-auto">
                  <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5">
                    <CardContent className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10 flex items-center justify-center">
                        <Star className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2 text-foreground">No Reviews Found</h2>
                      <p className="text-muted-foreground mb-6">
                        No reviews found for {ratingFilter} star rating.
                      </p>
                      <Button 
                        onClick={() => setRatingFilter(null)}
                        variant="outline"
                      >
                        View All Reviews
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}