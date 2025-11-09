import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickCheckoutProps {
  product: any;
  selectedPlan: any;
  onSuccess?: () => void;
}

export const QuickCheckout = ({ product, selectedPlan, onSuccess }: QuickCheckoutProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleWhatsAppOrder = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create WhatsApp message
      const message = `Hi! I'd like to order ${product.name} - ${selectedPlan.name}.

My Details:
• Name: ${formData.name}
• Email: ${formData.email}
• Phone: ${formData.phone || 'Not provided'}

Plan: ${selectedPlan.name}
Price: ${selectedPlan.price}

Please confirm availability and provide payment details.`;

      // Open WhatsApp
      const whatsappUrl = `https://wa.me/2348141988239?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      // Show success message
      toast({
        title: "WhatsApp Opened!",
        description: "Please complete your order through WhatsApp.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open WhatsApp. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectOrder = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Here you would integrate with your payment system
      // For now, we'll simulate a successful order
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Order Placed!",
        description: "Your order has been placed successfully. You'll receive confirmation via email.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Quick Order</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Get instant access to {product.name}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Product:</span>
            <span>{product.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Plan:</span>
            <span>{selectedPlan.name}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>${selectedPlan.price}</span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* Order Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleWhatsAppOrder}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4 mr-2" />
            )}
            Order via WhatsApp
          </Button>
          
          <Button
            onClick={handleDirectOrder}
            disabled={isLoading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Direct Order
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>100% Genuine Software</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>Instant Access</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>24/7 Support</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
