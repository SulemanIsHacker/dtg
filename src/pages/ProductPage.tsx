import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { SocialShare } from "@/components/SocialShare";
import { ArrowLeft, Star, Shield, CheckCircle, MessageCircle, Clock, Globe, Lock } from "lucide-react";
import { ProductTestimonials } from "@/components/ProductTestimonials";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from '@/integrations/supabase/client';
import { useProductImages } from '@/hooks/useProducts';
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { Seo } from "@/components/Seo";
import { ExpandableFAQ } from "@/components/ExpandableFAQ";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { useToast } from "@/hooks/use-toast";

// Import the new split components
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPricing } from "@/components/product/ProductPricing";
import { ProductFeatures } from "@/components/product/ProductFeatures";

const ProductPageContent = () => {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = usePersistentCart();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);

  const { images } = useProductImages(productId || undefined);
  
  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productSlug) return;
      
      try {
      const { data, error } = await supabase
        .from('products')
          .select('*')
        .eq('slug', productSlug)
        .single();
        
        if (error) throw error;
        
        setProduct(data);
        setProductId(data.id);
      } catch (err) {
        setError('Product not found');
        if (import.meta.env.DEV) {
          console.error('Error fetching product:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug]);

  // Fetch pricing plans
  useEffect(() => {
    if (!productId) return;
    
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('product_id', productId)
        .eq('is_enabled', true);
      
      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching pricing plans:', error);
        }
        return;
      }
      
      setPricingPlans(data || []);
    };
    
    fetchPlans();
  }, [productId]);

  const handleAddToCart = (planType: string, price: string) => {
    if (!product) return;

    const cartProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      subscription_type: planType,
      subscription_period: '1_month', // Default to monthly
      price: parseFloat(price),
      custom_price: parseFloat(price),
      main_image_url: product.main_image_url,
      pricing_plans: pricingPlans
    };

    addToCart(cartProduct);

    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });

    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Loading Product...</h2>
            <p className="text-muted-foreground">Fetching product details</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {product && (
        <Seo 
          title={`${product.name} — Shared Plans | DAILYTECH TOOLS SOLUTIONS`}
          description={product.detailed_description || product.description}
          canonicalPath={`/product/${product.slug}`}
          image={product.main_image_url}
          type="product"
        />
      )}
      <SchemaMarkup type="product" productData={product} />
      <motion.div
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 80 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="min-h-screen bg-background"
      >
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back Button and Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <SocialShare 
                productId={product.id}
                productName={product.name}
                productDescription={product.description}
                productSlug={product.slug}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Product Gallery */}
            <div className="space-y-6">
              <ProductGallery 
                product={product}
                images={images}
                              productName={product.name}
              />
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              {/* Product Info */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-muted-foreground text-lg mb-4">
                  {product.description}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating}/5 rating
                  </span>
                </div>
              </div>

              {/* Pricing Plans */}
              <ProductPricing 
                product={product}
                pricingPlans={pricingPlans}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>

          {/* Product Features */}
          <div className="mt-16">
            <ProductFeatures product={product} />
          </div>

          {/* Product Testimonials */}
          <div className="mt-16">
            <ProductTestimonials 
              productSlug={product.slug}
              productName={product.name}
            />
          </div>

            {/* FAQ Section */}
          <div className="mt-16">
            <ExpandableFAQ 
              title={`${product.name} - Frequently Asked Questions`}
              faqs={[
                {
                  question: `What is ${product.name}?`,
                  answer: product.description
                },
                {
                  question: `How do I get access to ${product.name}?`,
                  answer: "After payment confirmation, you'll receive account credentials via WhatsApp within minutes."
                },
                {
                  question: `Is ${product.name} genuine?`,
                  answer: "Yes, we provide 100% genuine software subscriptions from official sources."
                },
                {
                  question: `What if I have issues with ${product.name}?`,
                  answer: "Our 24/7 WhatsApp support team is always ready to help you with any issues."
                }
              ]}
            />
          </div>

          {/* Enhanced Trust & Security Section */}
          <div className="mt-16 space-y-8">
            {/* Refund Policy Link */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Refund Policy</h3>
                      <p className="text-sm text-muted-foreground">Learn about our refund terms and conditions</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/refund-policy')}
                  >
                    View Policy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center p-4 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-sm">SSL Secured</h4>
                  <p className="text-xs text-muted-foreground">256-bit encryption</p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-4 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-sm">Verified Seller</h4>
                  <p className="text-xs text-muted-foreground">Trusted by 1000+</p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-4 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-sm">24/7 Support</h4>
                  <p className="text-xs text-muted-foreground">WhatsApp & Email</p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-4 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-sm">Instant Delivery</h4>
                  <p className="text-xs text-muted-foreground">5-10 minutes</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Products - Customers Who Bought This Also Bought */}
          <Card>
            <CardHeader>
              <CardTitle>Customers Who Bought This Also Bought</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/product/midjourney-monthly')}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">MJ</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Midjourney Pro</h4>
                        <p className="text-xs text-muted-foreground">AI Image Generation</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <CurrencyDisplay pkrAmount={2500} />
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/product/canva-pro-yearly')}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">CP</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Canva Pro</h4>
                        <p className="text-xs text-muted-foreground">Design Platform</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <CurrencyDisplay pkrAmount={1800} />
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/product/chatgpt-plus-monthly')}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">CP</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">ChatGPT Plus</h4>
                        <p className="text-xs text-muted-foreground">AI Assistant</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <CurrencyDisplay pkrAmount={2000} />
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Chat Widget */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            size="lg" 
            className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700 shadow-lg"
            onClick={() => window.open('https://wa.me/2348141988239', '_blank')}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
      </motion.div>
    </>
  );
};

const ProductPage = () => {
  return <ProductPageContent />;
};

export default ProductPage;