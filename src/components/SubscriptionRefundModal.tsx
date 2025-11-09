import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  CreditCard, 
  Calendar,
  User,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionRefundModalProps {
  subscription: {
    id: string;
    user_auth_code_id: string;
    product_id: string;
    subscription_type: string;
    status: string;
    start_date: string;
    expiry_date: string;
    product?: {
      id: string;
      name: string;
      description: string;
      main_image_url: string | null;
      category: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

const REFUND_REASONS = [
  { value: 'not-working', label: 'Product not working as expected' },
  { value: 'technical-issues', label: 'Technical issues or bugs' },
  { value: 'not-suitable', label: 'Product not suitable for my needs' },
  { value: 'duplicate-purchase', label: 'Duplicate purchase' },
  { value: 'billing-error', label: 'Billing error' },
  { value: 'change-of-mind', label: 'Change of mind' },
  { value: 'other', label: 'Other reason' }
];

export const SubscriptionRefundModal = ({ subscription, isOpen, onClose }: SubscriptionRefundModalProps) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Please select a reason for the refund request');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a detailed description');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('=== SUBMITTING REFUND REQUEST ===');
      console.log('Subscription ID:', subscription.id);
      console.log('User Auth Code ID:', subscription.user_auth_code_id);
      console.log('Reason:', reason);
      console.log('Description:', description.trim());
      
      // Create the refund request
      const { data, error: refundError } = await supabase
        .from('subscription_refund_requests' as any)
        .insert({
          subscription_id: subscription.id,
          user_auth_code_id: subscription.user_auth_code_id,
          reason,
          description: description.trim()
        })
        .select()
        .single();

      console.log('Refund request result:', { data, error: refundError });

      if (refundError) {
        console.error('Refund request error:', refundError);
        throw refundError;
      }

      console.log('Refund request submitted successfully:', data);

      toast({
        title: "Refund Request Submitted",
        description: "Your refund request has been submitted and is under review. You'll receive an email confirmation shortly.",
      });

      // Reset form and close modal
      setReason('');
      setDescription('');
      onClose();

    } catch (error) {
      console.error('Error submitting refund request:', error);
      setError('Failed to submit refund request. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setDescription('');
      setError('');
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-sm sm:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CreditCard className="w-5 h-5" />
            Request Refund
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Submit a refund request for your subscription. Our team will review your request within 24-48 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Details */}
          <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
            <h3 className="font-semibold mb-3 text-foreground">Subscription Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Product:</span>
                <span className="font-medium text-foreground">{subscription.product?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan Type:</span>
                <Badge variant="outline" className="capitalize border-border text-foreground">
                  {subscription.subscription_type.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(subscription.status)}>
                  {subscription.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expires:</span>
                <span className="text-sm text-foreground">
                  {new Date(subscription.expiry_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Refund Request Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">
                Reason for Refund *
              </label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {REFUND_REASONS.map((reasonOption) => (
                    <SelectItem key={reasonOption.value} value={reasonOption.value} className="text-foreground focus:bg-muted">
                      {reasonOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">
                Detailed Description *
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide detailed information about why you're requesting a refund. Include any specific issues, error messages, or circumstances that led to this request."
                rows={4}
                maxLength={1000}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {description.length}/1000 characters
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Important Notice */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Refund requests are reviewed on a case-by-case basis. 
                Please ensure you've provided all necessary details to help us process your request quickly.
                You'll receive an email confirmation once your request is submitted.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !reason || !description.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
