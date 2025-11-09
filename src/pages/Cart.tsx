import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { OptimizedImage } from '@/components/OptimizedImage';
import { usePersistentCart } from '@/hooks/usePersistentCart';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

const CartContent = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    updateProductPlan, 
    clearCart, 
    getTotalPrice 
  } = usePersistentCart();
  const { toast } = useToast();

  // Cache for pricing plans to avoid repeated API calls
  const [pricingPlansCache, setPricingPlansCache] = useState<Record<string, any[]>>({});

  // Function to fetch pricing plans for a product
  const fetchPricingPlansForProduct = async (productId: string) => {
    try {
      const { data: pricingPlans, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('product_id', productId);

      if (error) {
        console.error('Error fetching pricing plans:', error);
        return;
      }

      if (pricingPlans) {
        setPricingPlansCache(prev => ({
          ...prev,
          [productId]: pricingPlans
        }));
      }
    } catch (error) {
      console.error('Error in fetchPricingPlansForProduct:', error);
    }
  };

  // Fetch pricing plans for all cart items on mount
  useEffect(() => {
    const fetchAllPricingPlans = async () => {
      const itemsNeedingPricingPlans = cartItems.filter(item => 
        !item.product.pricing_plans && !pricingPlansCache[item.product.id]
      );
      
      if (itemsNeedingPricingPlans.length === 0) return;

      const productIds = itemsNeedingPricingPlans.map(item => item.product.id);
      
      try {
        const { data: pricingPlans, error } = await supabase
          .from('pricing_plans')
          .select('*')
          .in('product_id', productIds);

        if (error) {
          console.error('Error fetching pricing plans:', error);
          return;
        }

        if (pricingPlans) {
          const newCache: Record<string, any[]> = {};
          pricingPlans.forEach(plan => {
            if (!newCache[plan.product_id]) {
              newCache[plan.product_id] = [];
            }
            newCache[plan.product_id].push(plan);
          });

          setPricingPlansCache(prev => ({
            ...prev,
            ...newCache
          }));
        }
      } catch (error) {
        console.error('Error in fetchAllPricingPlans:', error);
      }
    };

    fetchAllPricingPlans();
  }, [cartItems.length]); // Run when cart items change

  // Helper function to get available subscription types for a product
  const getAvailableSubscriptionTypes = (product: any) => {
    // Use cached pricing plans if available
    const pricingPlans = product.pricing_plans || pricingPlansCache[product.id];
    
    if (pricingPlans && pricingPlans.length > 0) {
      const availableTypes = pricingPlans
        .filter((plan: any) => plan.is_enabled)
        .map((plan: any) => plan.plan_type);
      
      return allSubscriptionTypes.filter(type => 
        availableTypes.includes(type.id)
      );
    }
    
    // If no pricing plans available, fetch them
    if (!pricingPlansCache[product.id]) {
      fetchPricingPlansForProduct(product.id);
    }
    
    // Fallback: if no pricing plans, show all types
    return allSubscriptionTypes;
  };

  // Helper function to get available subscription periods for a product
  const getAvailableSubscriptionPeriods = (product: any) => {
    // Use cached pricing plans if available
    const pricingPlans = product.pricing_plans || pricingPlansCache[product.id];
    
    if (pricingPlans && pricingPlans.length > 0) {
      const availablePeriods = pricingPlans
        .filter((plan: any) => plan.is_enabled)
        .map((plan: any) => {
          // Map pricing plan data to period IDs
          if (plan.monthly_price) return '1_month';
          if (plan.yearly_price) return '1_year';
          return '1_month'; // default fallback
        });
      
      return allSubscriptionPeriods.filter(period => 
        availablePeriods.includes(period.id)
      );
    }
    
    // If no pricing plans available, fetch them
    if (!pricingPlansCache[product.id]) {
      fetchPricingPlansForProduct(product.id);
    }
    
    // Fallback: if no pricing plans, show all periods
    return allSubscriptionPeriods;
  };


  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      toast({
        title: "Item removed",
        description: "Product has been removed from your cart.",
      });
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handlePlanChange = (productId: string, field: 'type' | 'period', value: string) => {
    const item = cartItems.find(item => item.product.id === productId);
    if (!item) return;

    const newType = field === 'type' ? value : item.product.subscription_type;
    const newPeriod = field === 'period' ? value : item.product.subscription_period;
    
    // Get pricing plans for this product
    const pricingPlans = item.product.pricing_plans || pricingPlansCache[item.product.id];
    
    if (pricingPlans && pricingPlans.length > 0) {
      // Find the matching pricing plan
      const matchingPlan = pricingPlans.find((plan: any) => {
        const planTypeMatches = plan.plan_type === newType;
        const periodMatches = (newPeriod === '1_month' && plan.monthly_price) || 
                             (newPeriod === '1_year' && plan.yearly_price);
        return planTypeMatches && periodMatches && plan.is_enabled;
      });

      if (matchingPlan) {
        // Use the actual price from the database
        const priceString = newPeriod === '1_month' ? matchingPlan.monthly_price : matchingPlan.yearly_price;
        const newPrice = parseFloat(priceString?.replace(/[^\d.]/g, '') || '0');
        
        updateProductPlan(productId, newType, newPeriod, newPrice);
        
        toast({
          title: "Plan updated",
          description: "Product plan has been updated successfully.",
        });
        return;
      }
    }
    
    // Fallback: if no matching plan found, use multiplier calculation
    const typeMultiplier = allSubscriptionTypes.find(t => t.id === newType)?.multiplier || 1;
    const periodMultiplier = allSubscriptionPeriods.find(p => p.id === newPeriod)?.multiplier || 1;
    
    // Get base price (assuming we have it stored somewhere, for now using current price)
    const basePrice = item.product.price / (typeMultiplier * periodMultiplier);
    const newPrice = Math.round(basePrice * typeMultiplier * periodMultiplier);

    updateProductPlan(productId, newType, newPeriod, newPrice);
    
    toast({
      title: "Plan updated",
      description: "Product plan has been updated successfully.",
    });
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some products to your cart first.",
        variant: "destructive"
      });
      return;
    }
    navigate('/checkout');
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
          <main className="flex-1 w-full py-12 px-2 sm:px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Looks like you haven't added any products to your cart yet. 
                  Browse our tools and add some products to get started!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/tools')}
                    className="bg-gradient-to-r from-primary to-brand-teal hover:from-primary/90 hover:to-brand-teal/90 text-white"
                  >
                    Browse Tools
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <main className="flex-1 w-full py-12 px-2 sm:px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent">
                  Shopping Cart
                </h1>
                <p className="text-muted-foreground mt-2">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleClearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.product.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product Image */}
                        <div className="w-full sm:w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <OptimizedImage
                            src={item.product.main_image_url || '/placeholder.svg'}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="font-semibold text-lg">{item.product.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{item.product.category}</p>
                          </div>

                          {/* Plan Selection */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm font-medium">Subscription Type</Label>
                              <Select
                                value={item.product.subscription_type}
                                onValueChange={(value) => handlePlanChange(item.product.id, 'type', value)}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableSubscriptionTypes(item.product).map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                      {type.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Duration</Label>
                              <Select
                                value={item.product.subscription_period}
                                onValueChange={(value) => handlePlanChange(item.product.id, 'period', value)}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableSubscriptionPeriods(item.product).map((period) => (
                                    <SelectItem key={period.id} value={period.id}>
                                      {period.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Quantity and Price */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-medium">Quantity:</Label>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                                  className="w-16 h-8 text-center"
                                  min="1"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-semibold">
                                <CurrencyDisplay 
                                  pkrAmount={(item.product.custom_price || item.product.price) * item.quantity} 
                                  size="lg"
                                />
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <CurrencyDisplay 
                                  pkrAmount={item.product.custom_price || item.product.price} 
                                  size="sm"
                                /> each
                              </div>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.product.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.product.name} × {item.quantity}
                          </span>
                          <CurrencyDisplay 
                            pkrAmount={(item.product.custom_price || item.product.price) * item.quantity} 
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total:</span>
                        <CurrencyDisplay pkrAmount={getTotalPrice()} size="lg" />
                      </div>
                    </div>

                    <Button 
                      onClick={handleProceedToCheckout}
                      className="w-full bg-gradient-to-r from-primary to-brand-teal hover:from-primary/90 hover:to-brand-teal/90 text-white"
                      size="lg"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Proceed to Checkout
                    </Button>

                    <Button 
                      variant="outline"
                      onClick={() => navigate('/tools')}
                      className="w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

const Cart = () => {
  return <CartContent />;
};

export default Cart;

