import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Shield, Check, Eye, TrendingDown, Zap, Crown, Lock, Award, Sparkles, ArrowRight, Clock, Users, Heart, ShoppingCart, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CurrencyDisplay } from "./CurrencyDisplay";
import { OptimizedImage } from "./OptimizedImage";
import { useState, useEffect } from "react";
import { usePersistentCart, CartProduct } from "@/hooks/usePersistentCart";
import { useToast } from "@/hooks/use-toast";

interface ToolCardWithCartProps {
  name: string;
  description: string;
  features?: string[] | null;
  image: string;
  category: string;
  rating: number;
  slug: string;
  productId: string; // Add the actual product ID (UUID)
  verified?: boolean;
  pricingPlans: Array<{
    plan_type: string;
    monthly_price?: string;
    yearly_price?: string;
    is_enabled: boolean;
  }>;
}

// Plan options - these will be filtered based on product's actual pricing plans
const allSubscriptionTypes = [
  { id: 'shared', name: 'Shared', multiplier: 1 },
  { id: 'semi_private', name: 'Semi-Private', multiplier: 1.5 },
  { id: 'private', name: 'Private', multiplier: 2 }
];

const allSubscriptionPeriods = [
  { id: '1_month', name: '1 Month', multiplier: 1 },
  { id: '3_months', name: '3 Months', multiplier: 2.5 },
  { id: '6_months', name: '6 Months', multiplier: 4.5 },
  { id: '1_year', name: '1 Year', multiplier: 8 },
  { id: '2_years', name: '2 Years', multiplier: 14 },
  { id: 'lifetime', name: 'Lifetime', multiplier: 25 }
];

// Utility function to get the display price (monthly preferred)
const getDisplayPrice = (pricingPlans: ToolCardWithCartProps['pricingPlans']) => {
  if (!pricingPlans || pricingPlans.length === 0) return null;
  
  // First try to find a monthly plan
  let monthly = pricingPlans.find(plan => plan.is_enabled && plan.monthly_price && plan.monthly_price !== '');
  if (monthly) {
    // Extract numeric value from price string (remove "PKR", "Rs", etc.)
    const priceValue = monthly.monthly_price.replace(/[^\d.,]/g, '').replace(',', '');
    return { price: priceValue, period: 'month' };
  }
  
  // If no monthly, try yearly
  let yearly = pricingPlans.find(plan => plan.is_enabled && plan.yearly_price && plan.yearly_price !== '');
  if (yearly) {
    // Extract numeric value from price string (remove "PKR", "Rs", etc.)
    const priceValue = yearly.yearly_price.replace(/[^\d.,]/g, '').replace(',', '');
    return { price: priceValue, period: 'year' };
  }
  
  return null;
};

export const ToolCardWithCart = ({
  name,
  description,
  features,
  image,
  category,
  rating,
  slug,
  productId,
  verified = true,
  pricingPlans,
}: ToolCardWithCartProps) => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { addToCart, isInCart } = usePersistentCart();
  const { toast } = useToast();
  
  const [selectedType, setSelectedType] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [showPlanOptions, setShowPlanOptions] = useState(false);

  // Helper function to get available subscription types for this product
  const getAvailableSubscriptionTypes = () => {
    if (pricingPlans && pricingPlans.length > 0) {
      const availableTypes = pricingPlans
        .filter((plan) => plan.is_enabled)
        .map((plan) => plan.plan_type);
      
      return allSubscriptionTypes.filter(type => 
        availableTypes.includes(type.id)
      );
    }
    
    // Fallback: if no pricing plans, show all types
    return allSubscriptionTypes;
  };

  // Helper function to get available subscription periods for this product
  const getAvailableSubscriptionPeriods = () => {
    if (pricingPlans && pricingPlans.length > 0) {
      const availablePeriods = pricingPlans
        .filter((plan) => plan.is_enabled)
        .map((plan) => {
          // Map pricing plan data to period IDs
          if (plan.monthly_price) return '1_month';
          if (plan.yearly_price) return '1_year';
          return '1_month'; // default fallback
        });
      
      return allSubscriptionPeriods.filter(period => 
        availablePeriods.includes(period.id as any)
      );
    }
    
    // Fallback: if no pricing plans, show all periods
    return allSubscriptionPeriods;
  };

  // Set initial values based on available options
  useEffect(() => {
    const availableTypes = getAvailableSubscriptionTypes();
    const availablePeriods = getAvailableSubscriptionPeriods();
    
    if (availableTypes.length > 0 && !selectedType) {
      setSelectedType(availableTypes[0].id);
    }
    
    if (availablePeriods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(availablePeriods[0].id);
    }
  }, [pricingPlans, selectedType, selectedPeriod]);

  const displayPrice = getDisplayPrice(pricingPlans);
  const basePrice = displayPrice ? parseFloat(displayPrice.price) : 0;

  // Calculate price based on plan selection
  const calculatePrice = (subscriptionType: string, subscriptionPeriod: string) => {
    if (pricingPlans && pricingPlans.length > 0) {
      // Find the matching pricing plan
      const matchingPlan = pricingPlans.find((plan: any) => {
        const planTypeMatches = plan.plan_type === subscriptionType;
        const periodMatches = (subscriptionPeriod === '1_month' && plan.monthly_price) || 
                             (subscriptionPeriod === '1_year' && plan.yearly_price);
        return planTypeMatches && periodMatches && plan.is_enabled;
      });

      if (matchingPlan) {
        // Use the actual price from the database
        const priceString = subscriptionPeriod === '1_month' ? matchingPlan.monthly_price : matchingPlan.yearly_price;
        return parseFloat(priceString?.replace(/[^\d.]/g, '') || '0');
      }
    }
    
    // Fallback: use base price if no matching plan found
    return basePrice;
  };

  const currentPrice = calculatePrice(selectedType, selectedPeriod);

  const handleViewProduct = () => {
    navigate(`/product/${slug}`);
  };

  const handleAddToCart = () => {
    if (!displayPrice) {
      toast({
        title: "No pricing available",
        description: "This product doesn't have pricing information available.",
        variant: "destructive"
      });
      return;
    }

    const cartProduct: CartProduct = {
      id: productId, // Use the actual product ID (UUID) from database
      name,
      category,
      subscription_type: selectedType,
      subscription_period: selectedPeriod,
      price: currentPrice,
      custom_price: currentPrice,
      main_image_url: image,
      pricing_plans: pricingPlans
    };

    addToCart(cartProduct);
    
    toast({
      title: "Added to cart!",
      description: `${name} (${allSubscriptionTypes.find(t => t.id === selectedType)?.name}) added to your cart.`,
    });
  };

  const isProductInCart = isInCart(productId);

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={!shouldReduceMotion ? { y: -5 } : {}}
    >
      <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden group-hover:shadow-2xl group-hover:shadow-primary/10">
        <CardContent className="p-0">
          {/* Enhanced Image Section */}
          <div className="relative overflow-hidden">
            <div className="aspect-video w-full relative">
              <OptimizedImage
                src={image}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay with gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <Badge className="bg-primary/90 text-white border-0 shadow-lg backdrop-blur-sm">
                  {category}
                </Badge>
              </div>

              {/* Rating Badge */}
              <div className="absolute top-3 right-3">
                <Badge className="bg-background/90 text-foreground border-0 shadow-lg backdrop-blur-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {rating}
                </Badge>
              </div>

              {/* Verified Badge */}
              {verified && (
                <div className="absolute bottom-3 right-3">
                  <Badge className="bg-green-500/90 text-white border-0 shadow-lg backdrop-blur-sm flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verified
                  </Badge>
                </div>
              )}

              {/* Hover Overlay with View Button */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1 }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleViewProduct}
                  className="bg-background/90 text-foreground hover:bg-background border-0 shadow-lg backdrop-blur-sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="p-5">
            {/* Header Section */}
            <div className="mb-4">
              <h3 className="font-bold text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>
            </div>

            {/* Enhanced Pricing Section */}
            {displayPrice && (
              <motion.div 
                className="mb-5 p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-brand-teal/10 rounded-2xl border border-primary/20 relative overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {displayPrice.period === 'month' ? 'Monthly Plan' : 'Yearly Plan'}
                      </span>
                    </div>
                    <Badge className="bg-gradient-to-r from-primary to-brand-teal text-white border-0 shadow-md px-3 py-1 text-xs font-semibold rounded-full">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {displayPrice.period === 'month' ? 'Popular' : 'Best Value'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-baseline gap-2 mb-3">
                    <CurrencyDisplay 
                      pkrAmount={currentPrice} 
                      size="lg"
                      variant="highlight"
                      className="bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent text-2xl font-bold"
                    />
                    <span className="text-sm text-muted-foreground font-medium">
                      /{allSubscriptionPeriods.find(p => p.id === selectedPeriod)?.name.toLowerCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground font-medium">Secure Access</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-brand-teal" />
                      <span className="text-xs text-muted-foreground">{allSubscriptionTypes.find(t => t.id === selectedType)?.name}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Plan Selection */}
            <div className="mb-4 space-y-3">
              {getAvailableSubscriptionTypes().length > 1 || getAvailableSubscriptionPeriods().length > 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPlanOptions(!showPlanOptions)}
                  className="w-full text-xs"
                >
                  {showPlanOptions ? 'Hide' : 'Customize'} Plan Options
                </Button>
              ) : null}
              
              {showPlanOptions && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSubscriptionTypes().map((type) => (
                            <SelectItem key={type.id} value={type.id} className="text-xs">
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Duration</label>
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSubscriptionPeriods().map((period) => (
                            <SelectItem key={period.id} value={period.id} className="text-xs">
                              {period.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Features */}
            <div className="space-y-2 mb-5">
              {features && features.length > 0 && features.slice(0, 3).map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-3 text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-5 h-5 bg-gradient-to-r from-primary to-brand-teal rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-muted-foreground font-medium line-clamp-1">{feature}</span>
                </motion.div>
              ))}
              {features && features.length > 3 && (
                <div className="text-xs text-muted-foreground ml-8">
                  +{features.length - 3} more features
                </div>
              )}
            </div>

            {/* Enhanced CTA Buttons */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Button 
                className="w-full bg-gradient-to-r from-primary via-primary to-brand-teal hover:from-primary/90 hover:via-primary/90 hover:to-brand-teal/90 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group/btn"
                onClick={handleViewProduct}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span className="text-base">View Details</span>
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </div>
              </Button>
              
              <Button 
                variant="outline"
                className="w-full border-primary/30 text-primary hover:bg-primary/10"
                onClick={handleAddToCart}
                disabled={!displayPrice}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isProductInCart ? 'Update in Cart' : 'Add to Cart'}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

