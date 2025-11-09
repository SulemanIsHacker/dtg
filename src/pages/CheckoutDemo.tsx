import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckoutModal } from '@/components/CheckoutModal';
import { ShoppingCartProvider, useShoppingCart } from '@/hooks/useShoppingCart';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';

// Sample products data
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

const ProductCard = ({ product }: { product: typeof sampleProducts[0] }) => {
  const { addToCart, isInCart, cartItems } = useShoppingCart();
  const [quantity, setQuantity] = useState(1);
  
  const cartItem = cartItems.find(item => item.product.id === product.id);
  const inCart = isInCart(product.id);

  const formatPeriod = (period: string) => {
    return period.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setQuantity(1);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {product.subscription_type.replace('_', ' ')}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Plan:</span>
            <span className="text-sm font-medium">{formatPeriod(product.subscription_period)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Price:</span>
            <CurrencyDisplay 
              pkrAmount={product.price} 
              size="sm" 
              className="font-semibold"
            />
          </div>

          {inCart && (
            <div className="bg-primary/10 text-primary text-sm p-2 rounded-lg text-center">
              In Cart ({cartItem?.quantity} item{cartItem?.quantity !== 1 ? 's' : ''})
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-8 w-8 p-0"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CartSummary = () => {
  const { cartItems, getTotalItems, getTotalPrice } = useShoppingCart();
  const [showCheckout, setShowCheckout] = useState(false);

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in cart
            </div>
            
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center text-sm">
                  <span className="truncate">{item.product.name}</span>
                  <span className="font-medium">×{item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-border pt-3">
              <div className="flex justify-between items-center font-semibold">
                <span>Total:</span>
                <CurrencyDisplay 
                  pkrAmount={getTotalPrice()} 
                  size="sm" 
                  className="font-bold text-primary"
                />
              </div>
            </div>
            
            <Button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Proceed to Checkout
            </Button>
          </div>
        </CardContent>
      </Card>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onCompletePurchase={(userDetails) => {
          console.log('Purchase completed:', userDetails);
          // Handle purchase completion
        }}
      />
    </>
  );
};

const CheckoutDemoContent = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Multi-Product Checkout Demo</h1>
          <p className="text-lg text-muted-foreground">
            Select multiple products and complete your purchase in a single transaction
          </p>
          <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-primary font-medium">
              💡 The checkout modal now includes product exploration! Try adding items to cart and then clicking "Proceed to Checkout"
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sampleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Cart Summary Sidebar */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutDemo = () => {
  return (
    <ShoppingCartProvider>
      <CheckoutDemoContent />
    </ShoppingCartProvider>
  );
};

export default CheckoutDemo;
