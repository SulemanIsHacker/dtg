import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CheckoutForm } from '@/components/CheckoutForm';
import { usePersistentCart } from '@/hooks/usePersistentCart';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

const CheckoutContent = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice } = usePersistentCart();

  // Convert cart items to checkout items format
  const checkoutItems = cartItems.map(item => ({
    product_id: item.product.id,
    product_name: item.product.name,
    subscription_type: item.product.subscription_type,
    subscription_period: item.product.subscription_period,
    price: (item.product.custom_price || item.product.price) * item.quantity
  }));

  const handleSuccess = (result: any) => {
    // Navigate to confirmation page
    navigate('/checkout-confirmation', { 
      state: { 
        result: result
      } 
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={() => navigate('/cart')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent">
                Checkout
              </h1>
              <p className="text-muted-foreground mt-2">
                Complete your purchase
              </p>
            </div>

            {/* Checkout Form */}
            <CheckoutForm
              items={checkoutItems}
              onSuccess={handleSuccess}
              onCancel={() => navigate('/cart')}
            />
          </div>
        </main>
      </div>
    </>
  );
};

const Checkout = () => {
  return <CheckoutContent />;
};

export default Checkout;
