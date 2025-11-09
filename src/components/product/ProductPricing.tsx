import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Crown, Check, Zap, Sparkles, Target, Clock, Rocket, MessageCircle } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { useToast } from "@/hooks/use-toast";

interface PricingPlan {
  id: string;
  plan_type: string;
  monthly_price: string;
  yearly_price: string;
}

interface ProductPricingProps {
  product: any;
  pricingPlans: PricingPlan[];
  onAddToCart: (planType: string, price: string) => void;
}

export const ProductPricing = ({ product, pricingPlans, onAddToCart }: ProductPricingProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingType, setBillingType] = useState<'monthly' | 'yearly'>('monthly');
  const { toast } = useToast();

  // Helper function to extract numeric price from string
  const extractNumericPrice = (priceString: string) => {
    if (!priceString) return 0;
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', ''));
  };

  // Determine available billing types
  const hasMonthly = pricingPlans.some(plan => {
    const price = extractNumericPrice(plan.monthly_price || '');
    return price > 0;
  });
  const hasYearly = pricingPlans.some(plan => {
    const price = extractNumericPrice(plan.yearly_price || '');
    return price > 0;
  });
  const showToggle = hasMonthly && hasYearly;

  // Set selectedPlan to first available plan when plans are loaded
  useEffect(() => {
    if (pricingPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(pricingPlans[0].plan_type);
    }
  }, [pricingPlans, selectedPlan]);

  // Map plan_type to display info
  const planMeta = {
    shared: {
      name: "Shared Plan",
      description: "Share with 4-5 other verified users",
      icon: Users,
      features: [
        "Full access to all premium features",
        "Share with 4-5 verified users",
        "24/7 support via WhatsApp",
        "Instant access after payment",
        "Comprehensive support",
        "Account credentials provided"
      ],
      availability: "Available"
    },
    "semi_private": {
      name: "Semi-Private Plan",
      description: "Share with only 2-3 users",
      icon: Shield,
      features: [
        "Full access to all premium features",
        "Share with only 2-3 users",
        "Priority support",
        "Faster account access",
        "Enhanced security",
        "Personal account manager"
      ],
      availability: "Available"
    },
    private: {
      name: "Private Plan",
      description: "Exclusive private account",
      icon: Crown,
      features: [
        "100% private account access",
        "No sharing with others",
        "Premium priority support",
        "Custom account setup",
        "Maximum security & privacy",
        "Dedicated account manager"
      ],
      availability: "Limited"
    }
  };

  // Helper function to get plan metadata with fallback
  const getPlanMeta = (planType: string) => {
    const meta = planMeta[planType as keyof typeof planMeta];
    if (meta) return meta;
    
    // Fallback for unknown plan types
    return {
      name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
      description: `Access to ${planType} features`,
      icon: Users,
      features: [
        "Full access to all premium features",
        "24/7 support via WhatsApp",
        "Instant access after payment",
        "Comprehensive support",
        "Regular updates and improvements"
      ],
      availability: "Available"
    };
  };

  // Compose plans to display from DB
  const allPlans = pricingPlans.map(plan => {
    const meta = getPlanMeta(plan.plan_type);
    const monthlyPrice = extractNumericPrice(plan.monthly_price || '');
    const yearlyPrice = extractNumericPrice(plan.yearly_price || '');
    
    return {
      id: plan.plan_type,
      name: meta.name,
      description: meta.description,
      price: monthlyPrice,
      yearlyPrice: yearlyPrice,
      originalPrice: product?.original_price,
      icon: meta.icon,
      features: meta.features,
      recommended: false,
      availability: meta.availability,
    };
  });

  // Filter plans based on billing type
  const filteredPlans = allPlans.map(plan => ({
    ...plan,
    price: billingType === 'monthly' ? plan.price : plan.yearlyPrice,
  })).filter(plan => plan.price && plan.price > 0);

  const selectedPlanData = filteredPlans.find(p => p.id === selectedPlan);

  // Set selectedPlan to first available filtered plan when billingType changes
  useEffect(() => {
    if (filteredPlans.length > 0) {
      if (!selectedPlan || !filteredPlans.some(p => p.id === selectedPlan)) {
        setSelectedPlan(filteredPlans[0].id);
      }
    } else {
      if (billingType === 'monthly' && hasYearly) {
        setBillingType('yearly');
      } else if (billingType === 'yearly' && hasMonthly) {
        setBillingType('monthly');
      } else {
        setSelectedPlan(null);
      }
    }
  }, [billingType, filteredPlans, selectedPlan, hasMonthly, hasYearly]);

  const handleAddToCart = (planType: string, price: string) => {
    if (!product || !selectedPlanData) return;

    onAddToCart(planType, price);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Pricing Section */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground">Select the perfect plan for your needs</p>
        </div>

        {/* Enhanced Billing Toggle */}
        {showToggle && (
          <div className="flex justify-center mb-6">
            <div className="bg-background/80 backdrop-blur-sm rounded-xl p-1 border border-border/50">
              <button
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  billingType === 'monthly' 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setBillingType('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  billingType === 'yearly' 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setBillingType('yearly')}
              >
                Yearly
                <Badge className="ml-2 bg-green-500 text-white text-xs">Save 20%</Badge>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Plan Cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPlans.map((plan, index) => {
            const IconComponent = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-lg scale-[1.02]' 
                    : 'hover:shadow-md hover:scale-[1.01]'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg">{plan.name}</span>
                          {plan.recommended && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                          {index === 0 && (
                            <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                              <Target className="w-3 h-3 mr-1" />
                              Best Value
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <CurrencyDisplay pkrAmount={plan.price} />
                        {billingType === 'yearly' && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Save 20%
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {plan.availability}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Enhanced Selected Plan Details */}
      {selectedPlanData && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="font-bold text-xl mb-2 flex items-center justify-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                {selectedPlanData.name} Package
              </h3>
              <p className="text-muted-foreground">Everything you need to get started</p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {selectedPlanData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* Price and CTA Section */}
            <div className="bg-background/80 rounded-xl p-4 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CurrencyDisplay pkrAmount={selectedPlanData.price} />
                    {selectedPlanData.originalPrice && selectedPlanData.price && !isNaN(Number(selectedPlanData.originalPrice)) && !isNaN(Number(selectedPlanData.price)) && (
                      <Badge className="bg-red-100 text-red-700 border-red-200 text-sm">
                        {Math.round(((Number(selectedPlanData.originalPrice) - Number(selectedPlanData.price)) / Number(selectedPlanData.originalPrice)) * 100)}% OFF
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {billingType === 'monthly' ? 'per month' : 'per year'}
                  </p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                  <Clock className="w-3 h-3 mr-1" />
                  {selectedPlanData.availability}
                </Badge>
              </div>
              
              <Button 
                variant="default" 
                size="lg" 
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => handleAddToCart(selectedPlanData.id, selectedPlanData.price.toString())}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Get {selectedPlanData.name} Now
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-3">
                <Shield className="w-3 h-3 inline mr-1" />
                Secure payment • Instant delivery • 24/7 support
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
