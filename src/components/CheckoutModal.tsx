import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ShoppingCart, User, Mail, Plus, Minus, Trash2, Search, Grid3X3 } from 'lucide-react';
import { CurrencyDisplay } from './CurrencyDisplay';
import { SubscriptionReceipt } from './SubscriptionReceipt';
import { useShoppingCart } from '@/hooks/useShoppingCart';

interface Product {
  id: string;
  name: string;
  category: string;
  subscription_type: string;
  subscription_period: string;
  price: number;
  custom_price?: number | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompletePurchase: (userDetails: { fullName: string; email: string }) => void;
}

// Sample products for exploration
const sampleProducts = [
  {
    id: 'prod-1',
    name: 'Perplexity AI',
    category: 'ai-tools',
    subscription_type: 'shared',
    subscription_period: '1_month',
    price: 1000,
    custom_price: null
  },
  {
    id: 'prod-2',
    name: 'ChatGPT Plus',
    category: 'ai-tools',
    subscription_type: 'private',
    subscription_period: '1_month',
    price: 2000,
    custom_price: null
  },
  {
    id: 'prod-3',
    name: 'Google Pro Plan',
    category: 'productivity',
    subscription_type: 'semi_private',
    subscription_period: '3_months',
    price: 1500,
    custom_price: null
  },
  {
    id: 'prod-4',
    name: 'Canva Pro',
    category: 'design',
    subscription_type: 'shared',
    subscription_period: '1_year',
    price: 3000,
    custom_price: null
  },
  {
    id: 'prod-5',
    name: 'Midjourney',
    category: 'ai-tools',
    subscription_type: 'private',
    subscription_period: '1_month',
    price: 2500,
    custom_price: null
  },
  {
    id: 'prod-6',
    name: 'Figma Professional',
    category: 'design',
    subscription_type: 'semi_private',
    subscription_period: '6_months',
    price: 1800,
    custom_price: null
  }
];

export const CheckoutModal = ({
  isOpen,
  onClose,
  onCompletePurchase
}: CheckoutModalProps) => {
  const { cartItems, updateQuantity, removeFromCart, addToCart } = useShoppingCart();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProductExploration, setShowProductExploration] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const calculateItemTotal = (item: CartItem) => {
    const price = item.product.custom_price || item.product.price;
    return price * item.quantity;
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const handleCompletePurchase = async () => {
    if (!fullName.trim() || !email.trim()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onCompletePurchase({ fullName, email });
      setShowReceipt(true);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPeriod = (period: string) => {
    return period.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-border">
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-foreground">Checkout</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Enter your details to complete your purchase</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-muted/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Order Summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No items in cart</p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{item.product.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.product.subscription_type.replace('_', ' ')} - {formatPeriod(item.product.subscription_period)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">{item.product.category}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right min-w-[100px]">
                            <CurrencyDisplay 
                              pkrAmount={calculateItemTotal(item)} 
                              size="sm" 
                              className="font-semibold"
                            />
                          </div>
                          
                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Total */}
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-foreground">Total:</span>
                        <CurrencyDisplay 
                          pkrAmount={calculateTotal()} 
                          size="lg" 
                          className="font-bold text-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Product Exploration Section */}
          <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Grid3X3 className="w-5 h-5" />
                  Explore More Products
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProductExploration(!showProductExploration)}
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  {showProductExploration ? 'Hide' : 'Show'} Products
                </Button>
              </div>
            </CardHeader>
            {showProductExploration && (
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Add more products to your cart without losing your current items
                </p>
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {sampleProducts
                    .filter(product => 
                      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      product.category.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((product) => {
                      const formatPeriod = (period: string) => {
                        return period.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                      };

                      return (
                        <Card key={product.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-sm">{product.name}</h4>
                                  <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {product.subscription_type.replace('_', ' ')}
                                </Badge>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                  {formatPeriod(product.subscription_period)}
                                </span>
                                <CurrencyDisplay 
                                  pkrAmount={product.price} 
                                  size="sm" 
                                  className="font-semibold text-sm"
                                />
                              </div>

                              <Button
                                onClick={() => addToCart(product)}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                size="sm"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add to Cart
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </CardContent>
            )}
          </Card>

            {/* User Details Form */}
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-muted/20 border-border"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/20 border-border"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If you're a returning customer, use the same email address to link to your existing account.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompletePurchase}
                disabled={!fullName.trim() || !email.trim() || cartItems.length === 0 || isProcessing}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Complete Purchase
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <SubscriptionReceipt
          subscription={{
            id: `sub-${Date.now()}`,
            start_date: new Date().toISOString(),
            expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            auto_renew: false,
            notes: 'Multi-product purchase',
            user_auth_code: {
              user_name: fullName,
              user_email: email,
              code: `USER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            },
            products: cartItems.map(item => ({
              ...item.product,
              price: item.product.custom_price || item.product.price
            }))
          }}
          onClose={() => {
            setShowReceipt(false);
            onClose();
            // Reset form
            setFullName('');
            setEmail('');
          }}
        />
      )}
    </>
  );
};
