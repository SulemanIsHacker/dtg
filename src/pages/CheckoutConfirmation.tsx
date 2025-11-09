import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  MessageCircle, 
  Copy, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ShoppingCart,
  User,
  Mail,
  Clock,
  Shield,
  Plus,
  Minus,
  X
} from 'lucide-react';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { CheckoutModal } from '@/components/CheckoutModal';
import { ShoppingCartProvider, useShoppingCart } from '@/hooks/useShoppingCart';

interface CheckoutResult {
  success: boolean;
  user_code: string;
  is_returning_user: boolean;
  product_codes: Array<{
    product_code: string;
    product_id: string;
    product_name: string;
  }>;
  total_amount: number;
  currency: string;
  user_name: string;
  user_email: string;
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

const CheckoutConfirmationContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, addToCart, getTotalItems, getTotalPrice } = useShoppingCart();
  const [showCodes, setShowCodes] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showProductExploration, setShowProductExploration] = useState(false);

  useEffect(() => {
    // Get result from location state or URL params
    const stateResult = location.state?.result;
    if (stateResult) {
      setResult(stateResult);
    } else {
      // If no state, redirect to home
      navigate('/');
    }
  }, [location.state, navigate]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard"
    });
  };

  const handleWhatsAppContact = () => {
    if (!result) return;

    const productCodesText = result.product_codes
      .map(pc => `• ${pc.product_code} (${pc.product_name})`)
      .join('\n');

    const message = `Hi! I just completed my purchase and here are my details:

${result.is_returning_user ? 'Returning Customer' : 'New Customer'}
User Code: ${result.user_code}
Email: ${result.user_email}

Product Codes:
${productCodesText}

Total: ${result.total_amount} ${result.currency}

Please approve my product codes and provide access. Thank you!`;

    window.open(`https://wa.me/2348141988239?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we process your confirmation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl text-green-600">
                {result.is_returning_user ? "Purchase Successful!" : "Account Created!"}
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                {result.is_returning_user 
                  ? "New product codes generated for your existing account"
                  : "Your account has been created successfully"
                }
              </p>
            </CardHeader>
          </Card>

          {/* User Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{result.user_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{result.user_email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={result.is_returning_user ? "secondary" : "default"}>
                  {result.is_returning_user ? "Returning Customer" : "New Customer"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Contact */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-green-800 text-lg">Next Step: Send Product Codes</span>
                </div>
                <p className="text-green-700 mb-4">
                  Send your Product Code(s) to our WhatsApp for activation. Our admin will approve your access within 24 hours.
                </p>
                <Button 
                  onClick={handleWhatsAppContact}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Send Product Codes via WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Code */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {result.is_returning_user ? "Your User Code" : "Your New User Code (Permanent)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Login Code</span>
                  <Badge variant={result.is_returning_user ? "secondary" : "default"}>
                    {result.is_returning_user ? "Existing" : "New"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-background px-4 py-3 rounded border flex-1 font-mono text-xl font-bold">
                    {result.user_code}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.user_code)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {result.is_returning_user 
                    ? "This is your permanent login code. Keep it safe!"
                    : "This is your permanent login code. Save it for future purchases!"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Product Codes */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Product Codes (Send to Admin)
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCodes(!showCodes)}
                >
                  {showCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showCodes ? 'Hide' : 'Show'} Codes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showCodes ? (
                <div className="space-y-4">
                  {result.product_codes.map((pc, index) => (
                    <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-amber-800">{pc.product_name}</span>
                        <Badge variant="outline" className="text-amber-700 border-amber-300">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending Approval
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-4 py-3 rounded border flex-1 font-mono text-lg font-bold text-amber-800">
                          {pc.product_code}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(pc.product_code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Click "Show Codes" to view your product codes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Purchase Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Items:</span>
                  <span className="font-medium">{result.product_codes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Amount:</span>
                  <span className="font-medium">
                    <CurrencyDisplay pkrAmount={result.total_amount} size="sm" />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Admin Approval
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buy More Products Section */}
          <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Want to explore more tools?</h3>
                <p className="text-muted-foreground mb-4">
                  Discover our full collection of premium tools and add them to your cart without losing your current items.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setShowProductExploration(!showProductExploration)}
                    className="bg-primary hover:bg-primary/90 text-white"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {showProductExploration ? 'Hide Products' : 'Explore Products'}
                  </Button>
                  <Button
                    onClick={() => navigate('/tools')}
                    variant="outline"
                    size="lg"
                  >
                    Browse All Products
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Exploration Section */}
          {showProductExploration && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Explore More Products
                  </CardTitle>
                  {cartItems.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-primary">
                        {getTotalItems()} items in cart
                      </Badge>
                      <Button
                        onClick={() => setShowCheckout(true)}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        Checkout ({getTotalItems()})
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sampleProducts.map((product) => {
                    const formatPeriod = (period: string) => {
                      return period.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                    };

                    return (
                      <Card key={product.id} className="hover:shadow-lg transition-shadow">
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

                            <Button
                              onClick={() => addToCart(product)}
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Important Notice */}
          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Your product codes will expire in 48 hours if not approved. 
              Please send them to WhatsApp as soon as possible to ensure timely activation.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => navigate('/subscriptions')}
              className="flex-1"
            >
              <User className="w-4 h-4 mr-2" />
              View Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onCompletePurchase={(userDetails) => {
          if (import.meta.env.DEV) {
            console.log('Additional purchase completed:', userDetails);
          }
          toast({
            title: "Purchase Successful!",
            description: "Your additional products have been added to your account."
          });
          setShowCheckout(false);
        }}
      />
    </div>
  );
};

const CheckoutConfirmation = () => {
  return (
    <ShoppingCartProvider>
      <CheckoutConfirmationContent />
    </ShoppingCartProvider>
  );
};

export default CheckoutConfirmation;
