import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Mail, ShoppingCart, CheckCircle, MessageCircle, Copy, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { ErrorHandler, useErrorHandler } from '@/utils/errorHandler';

interface CheckoutItem {
  product_id: string;
  product_name: string;
  subscription_type: string;
  subscription_period: string;
  price: number;
}

interface CheckoutFormProps {
  items: CheckoutItem[];
  onSuccess?: (result: any) => void;
  onCancel?: () => void;
}

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

export const CheckoutForm = ({ items, onSuccess, onCancel }: CheckoutFormProps) => {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [showCodes, setShowCodes] = useState(false);
  const { toast } = useToast();
  const errorHandler = useErrorHandler({ component: 'CheckoutForm' });

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.user_name.trim() || !formData.user_email.trim()) {
      const validationError = ErrorHandler.create.validationError('Please fill in all required fields');
      errorHandler.handle(validationError);
      setError(validationError.message);
      return;
    }


    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.user_email)) {
      const validationError = ErrorHandler.create.validationError('Please enter a valid email address');
      errorHandler.handle(validationError);
      setError(validationError.message);
      return;
    }

    // Validate name length
    if (formData.user_name.length < 2 || formData.user_name.length > 100) {
      const validationError = ErrorHandler.create.validationError('Name must be between 2 and 100 characters');
      errorHandler.handle(validationError);
      setError(validationError.message);
      return;
    }


    setIsLoading(true);
    setError('');

    try {
      // Prepare products data
      const products = items.map(item => ({
        product_id: item.product_id,
        subscription_type: item.subscription_type,
        subscription_period: item.subscription_period,
        price: parseFloat(item.price.toString())
      }));

      // Debug: Log the data being sent (development only)
      if (import.meta.env.DEV) {
        console.log('Sending to database:', {
          p_user_name: formData.user_name.trim(),
          p_user_email: formData.user_email.trim().toLowerCase(),
          p_products: products,
          p_currency: 'NGN'
        });
      }

      // Call the database function
      const { data, error: dbError } = await supabase.rpc('create_simple_purchase' as any, {
        p_user_name: formData.user_name.trim(),
        p_user_email: formData.user_email.trim().toLowerCase(),
        p_products: products,
        p_currency: 'NGN'
      });

      if (dbError) {
        console.error('Database error details:', dbError);
        throw ErrorHandler.create.serverError(dbError.message || 'Database operation failed');
      }

      console.log('Database response:', data);

      if (data?.success) {
        const resultWithUserInfo = {
          ...data,
          user_name: formData.user_name.trim(),
          user_email: formData.user_email.trim().toLowerCase()
        };
        setResult(resultWithUserInfo as CheckoutResult);
        toast({
          title: (data as CheckoutResult).is_returning_user ? "Welcome back!" : "Account created!",
          description: (data as CheckoutResult).is_returning_user 
            ? "New product codes generated for your existing account"
            : "Your account has been created with a permanent User Code"
        });
        onSuccess?.(resultWithUserInfo);
      } else {
        console.error('Purchase failed:', data);
        const errorMessage = data?.error || 'Failed to process purchase';
        throw ErrorHandler.create.serverError(errorMessage);
      }
    } catch (error: any) {
      const handledError = errorHandler.handle(error);
      setError(handledError.message);
    } finally {
      setIsLoading(false);
    }
  };

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
Email: ${formData.user_email}

Product Codes:
${productCodesText}

Total: ${result.total_amount} ${result.currency}

Please approve my product codes and provide access. Thank you!`;

    window.open(`https://wa.me/2348141988239?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (result) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            {result.is_returning_user ? "Purchase Successful!" : "Account Created!"}
          </CardTitle>
          <p className="text-muted-foreground">
            {result.is_returning_user 
              ? "New product codes generated for your existing account"
              : "Your account has been created successfully"
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Code */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <Label className="font-semibold">
                {result.is_returning_user ? "Your Existing User Code" : "Your New User Code (Permanent)"}
              </Label>
              <Badge variant={result.is_returning_user ? "secondary" : "default"}>
                {result.is_returning_user ? "Existing" : "New"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-background px-3 py-2 rounded border flex-1 font-mono text-lg">
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
            <p className="text-sm text-muted-foreground mt-2">
              {result.is_returning_user 
                ? "This is your permanent login code. Keep it safe!"
                : "This is your permanent login code. Save it for future purchases!"
              }
            </p>
          </div>

          {/* Product Codes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-lg">Product Codes (Send to Admin)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCodes(!showCodes)}
              >
                {showCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showCodes ? 'Hide' : 'Show'} Codes
              </Button>
            </div>
            
            {showCodes && (
              <div className="space-y-3">
                {result.product_codes.map((pc, index) => (
                  <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-amber-800">{pc.product_name}</span>
                      <Badge variant="outline" className="text-amber-700 border-amber-300">
                        Pending Approval
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-background px-3 py-2 rounded border flex-1 font-mono text-lg text-amber-800">
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
            )}
          </div>

          {/* WhatsApp Contact */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Next Step: Send Product Codes</span>
            </div>
            <p className="text-sm text-green-700 mb-4">
              Send your Product Code(s) to our WhatsApp for activation. Our admin will approve your access within 24 hours.
            </p>
            <Button 
              onClick={handleWhatsAppContact}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Product Codes via WhatsApp
            </Button>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Purchase Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span><CurrencyDisplay pkrAmount={result.total_amount} size="sm" /></span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-amber-600">Pending Admin Approval</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setFormData({ user_name: '', user_email: '' });
              }}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Purchase
            </Button>
            <Button
              onClick={() => window.location.href = '/subscriptions'}
              className="flex-1"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Checkout
        </CardTitle>
        <p className="text-muted-foreground">
          Enter your details to complete your purchase
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-3">Order Summary</h4>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">{item.product_name}</span>
                  <span className="text-muted-foreground ml-2">
                    ({item.subscription_type} - {item.subscription_period})
                  </span>
                </div>
                <CurrencyDisplay pkrAmount={item.price} size="sm" />
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between items-center font-semibold">
              <span>Total:</span>
              <CurrencyDisplay pkrAmount={totalAmount} size="sm" />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="user_name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name *
            </Label>
            <Input
              id="user_name"
              type="text"
              placeholder="Enter your full name"
              value={formData.user_name}
              onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
            </Label>
            <Input
              id="user_email"
              type="email"
              placeholder="Enter your email address"
              value={formData.user_email}
              onChange={(e) => setFormData(prev => ({ ...prev, user_email: e.target.value }))}
              required
            />
            <p className="text-xs text-muted-foreground">
              If you're a returning customer, use the same email address to link to your existing account.
            </p>
          </div>


          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
        </form>
      </CardContent>
    </Card>
  );
};
