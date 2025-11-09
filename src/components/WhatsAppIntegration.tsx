import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Copy, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';

interface ProductCode {
  product_code: string;
  product_name: string;
  status?: 'pending' | 'approved' | 'rejected';
}

interface WhatsAppIntegrationProps {
  userCode: string;
  userEmail: string;
  userName: string;
  isReturningUser: boolean;
  productCodes: ProductCode[];
  totalAmount: number;
  currency: string;
  onMessageSent?: () => void;
}

export const WhatsAppIntegration = ({
  userCode,
  userEmail,
  userName,
  isReturningUser,
  productCodes,
  totalAmount,
  currency,
  onMessageSent
}: WhatsAppIntegrationProps) => {
  const [messageSent, setMessageSent] = useState(false);
  const { toast } = useToast();

  const generateMessage = () => {
    const productCodesText = productCodes
      .map(pc => `• ${pc.product_code} (${pc.product_name})`)
      .join('\n');

    return `Hi! I just completed my purchase and here are my details:

${isReturningUser ? 'Returning Customer' : 'New Customer'}
User Code: ${userCode}
Email: ${userEmail}
Name: ${userName}

Product Codes:
${productCodesText}

Total: ${totalAmount} ${currency}

Please approve my product codes and provide access. Thank you!`;
  };

  const handleWhatsAppContact = () => {
    const message = generateMessage();
    const whatsappUrl = `https://wa.me/2348141988239?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    setMessageSent(true);
    onMessageSent?.();
    
    toast({
      title: "WhatsApp opened",
      description: "Your message has been prepared for WhatsApp"
    });
  };

  const copyMessage = () => {
    const message = generateMessage();
    navigator.clipboard.writeText(message);
    toast({
      title: "Message copied",
      description: "Product codes message copied to clipboard"
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-600 border-amber-300">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-600" />
          Send Product Codes via WhatsApp
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Send your product codes to our admin for approval and activation
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Information */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Customer Information</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Name:</span>
              <span className="font-medium">{userName}</span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-medium">{userEmail}</span>
            </div>
            <div className="flex justify-between">
              <span>User Code:</span>
              <code className="bg-background px-2 py-1 rounded font-mono text-sm">
                {userCode}
              </code>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <Badge variant={isReturningUser ? "secondary" : "default"}>
                {isReturningUser ? "Returning" : "New"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Product Codes */}
        <div>
          <h4 className="font-semibold mb-2">Product Codes to Send</h4>
          <div className="space-y-2">
            {productCodes.map((pc, index) => (
              <div key={index} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(pc.status)}
                  <div>
                    <code className="font-mono text-sm font-bold text-amber-800">
                      {pc.product_code}
                    </code>
                    <p className="text-xs text-amber-700">{pc.product_name}</p>
                  </div>
                </div>
                {getStatusBadge(pc.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Amount:</span>
            <CurrencyDisplay pkrAmount={totalAmount} size="sm" variant="highlight" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={copyMessage}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Message
          </Button>
          <Button
            onClick={handleWhatsAppContact}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={messageSent}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {messageSent ? "Message Sent" : "Open WhatsApp"}
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-semibold text-blue-800 mb-2">Instructions:</h5>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Click "Open WhatsApp" to send your product codes</li>
            <li>Our admin will review and approve your codes within 24 hours</li>
            <li>Once approved, you'll receive access to your purchased products</li>
            <li>You can track the status in your subscription dashboard</li>
          </ol>
        </div>

        {/* Status */}
        {messageSent && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="font-semibold">Message sent successfully!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Our admin will review your product codes and approve them within 24 hours.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
