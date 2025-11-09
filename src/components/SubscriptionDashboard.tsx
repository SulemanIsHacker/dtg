import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  LogOut,
  User,
  Mail,
  CreditCard,
  Settings,
  History,
  Receipt,
  DollarSign,
  MessageCircle,
  Copy
} from 'lucide-react';
import { useSubscriptionAuth } from '@/hooks/useSubscriptionAuth';
import { SubscriptionRefundModal } from './SubscriptionRefundModal';
import { supabase } from '@/integrations/supabase/client';
import { CredentialsDisplay } from './CredentialsDisplay';

interface SubscriptionStatusProps {
  status: 'active' | 'expiring_soon' | 'expired' | 'cancelled';
  expiryDate: string;
  customPrice?: number | null;
  subscriptionType: string;
  subscriptionPeriod: string;
  currency?: string;
}

interface RefundRequest {
  id: string;
  subscription_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  admin_notes: string | null;
  refund_amount: number | null;
  refund_method: string | null;
  processed_at: string | null;
  created_at: string;
}

interface PastSubscription {
  id: string;
  user_auth_code_id: string;
  product_id: string;
  subscription_type: 'shared' | 'semi_private' | 'private';
  subscription_period: '1_month' | '3_months' | '6_months' | '1_year' | '2_years' | 'lifetime';
  status: 'expired' | 'cancelled';
  start_date: string;
  expiry_date: string;
  auto_renew: boolean;
  notes: string | null;
  custom_price: number | null;
  username: string | null;
  password: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    main_image_url: string | null;
    category: string;
  };
  refund_requests?: RefundRequest[];
}

interface ProductCode {
  id: string;
  product_code: string;
  product_id: string;
  subscription_type: string;
  subscription_period: string;
  price: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  admin_notes: string | null;
  expires_at: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    category: string;
  };
}

const SubscriptionStatus = ({ status, expiryDate, customPrice, subscriptionType, subscriptionPeriod, currency = 'PKR' }: SubscriptionStatusProps) => {
  const calculatePrice = () => {
    if (customPrice) {
      return customPrice.toFixed(2);
    }

    const basePrices = {
      shared: 5,
      semi_private: 10,
      private: 15
    };

    const periodMultipliers = {
      '1_month': 1,
      '3_months': 2.5,
      '6_months': 4.5,
      '1_year': 8,
      '2_years': 14,
      'lifetime': 25
    };

    const basePrice = basePrices[subscriptionType as keyof typeof basePrices] || 5;
    const multiplier = periodMultipliers[subscriptionPeriod as keyof typeof periodMultipliers] || 1;
    
    return (basePrice * multiplier).toFixed(2);
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-primary/20 text-primary border-primary/30',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Active',
          bgColor: 'bg-primary/5',
          borderColor: 'border-primary/30',
          timeColor: 'text-primary'
        };
      case 'expiring_soon':
        return {
          color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'Expiring Soon',
          bgColor: 'bg-yellow-500/5',
          borderColor: 'border-yellow-500/30',
          timeColor: 'text-yellow-500'
        };
      case 'expired':
        return {
          color: 'bg-red-500/20 text-red-500 border-red-500/30',
          icon: <XCircle className="w-4 h-4" />,
          text: 'Expired',
          bgColor: 'bg-red-500/5',
          borderColor: 'border-red-500/30',
          timeColor: 'text-red-500'
        };
      case 'cancelled':
        return {
          color: 'bg-muted/20 text-muted-foreground border-muted/30',
          icon: <XCircle className="w-4 h-4" />,
          text: 'Cancelled',
          bgColor: 'bg-muted/5',
          borderColor: 'border-muted/30',
          timeColor: 'text-muted-foreground'
        };
      default:
        return {
          color: 'bg-muted/20 text-muted-foreground border-muted/30',
          icon: <Clock className="w-4 h-4" />,
          text: 'Unknown',
          bgColor: 'bg-muted/5',
          borderColor: 'border-muted/30',
          timeColor: 'text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig();
  const expiryDateObj = new Date(expiryDate);
  const isExpired = expiryDateObj < new Date();
  const daysUntilExpiry = Math.ceil((expiryDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const formatTimeRemaining = () => {
    if (isExpired) return 'Expired';
    if (daysUntilExpiry >= 365) {
      const years = Math.floor(daysUntilExpiry / 365);
      return `${years} year${years > 1 ? 's' : ''} remaining`;
    } else if (daysUntilExpiry >= 30) {
      const months = Math.floor(daysUntilExpiry / 30);
      return `${months} month${months > 1 ? 's' : ''} remaining`;
    } else if (daysUntilExpiry > 0) {
      return `${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''} remaining`;
    } else {
      return 'Expires today';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <Badge className={`${config.color} border-0 font-medium`}>
          {config.icon}
          <span className="ml-2">{config.text}</span>
        </Badge>
        {!isExpired && (
          <span className={`text-sm font-semibold ${config.timeColor}`}>
            {formatTimeRemaining()}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="font-medium">
            {isExpired ? 'Expired on' : 'Expires on'} {expiryDateObj.toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Price:</span>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-foreground">{currency} {calculatePrice()}</span>
            {customPrice && (
              <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">Custom</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PastSubscriptionStatus = ({ subscription }: { subscription: PastSubscription }) => {
  const calculatePrice = () => {
    if (subscription.custom_price) {
      return subscription.custom_price.toFixed(2);
    }

    const basePrices = {
      shared: 5,
      semi_private: 10,
      private: 15
    };

    const periodMultipliers = {
      '1_month': 1,
      '3_months': 2.5,
      '6_months': 4.5,
      '1_year': 8,
      '2_years': 14,
      'lifetime': 25
    };

    const basePrice = basePrices[subscription.subscription_type] || 5;
    const multiplier = periodMultipliers[subscription.subscription_period] || 1;
    
    return (basePrice * multiplier).toFixed(2);
  };

  const getStatusConfig = () => {
    switch (subscription.status) {
      case 'expired':
        return {
          color: 'bg-red-500/20 text-red-500 border-red-500/30',
          icon: <XCircle className="w-4 h-4" />,
          text: 'Expired',
          bgColor: 'bg-red-500/5',
          borderColor: 'border-red-500/30',
          timeColor: 'text-red-500'
        };
      case 'cancelled':
        return {
          color: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
          icon: <XCircle className="w-4 h-4" />,
          text: 'Cancelled',
          bgColor: 'bg-gray-500/5',
          borderColor: 'border-gray-500/30',
          timeColor: 'text-gray-500'
        };
      default:
        return {
          color: 'bg-muted/20 text-muted-foreground border-muted/30',
          icon: <Clock className="w-4 h-4" />,
          text: 'Unknown',
          bgColor: 'bg-muted/5',
          borderColor: 'border-muted/30',
          timeColor: 'text-muted-foreground'
        };
    }
  };

  const getRefundStatus = () => {
    if (!subscription.refund_requests || subscription.refund_requests.length === 0) {
      return null;
    }

    const latestRefund = subscription.refund_requests[0]; // Assuming ordered by created_at desc
    
    switch (latestRefund.status) {
      case 'completed':
        return {
          color: 'bg-green-500/20 text-green-500 border-green-500/30',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Refunded',
          amount: latestRefund.refund_amount
        };
      case 'approved':
        return {
          color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Refund Approved',
          amount: latestRefund.refund_amount
        };
      case 'rejected':
        return {
          color: 'bg-red-500/20 text-red-500 border-red-500/30',
          icon: <XCircle className="w-4 h-4" />,
          text: 'Refund Rejected',
          amount: null
        };
      case 'under_review':
        return {
          color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
          icon: <Clock className="w-4 h-4" />,
          text: 'Refund Under Review',
          amount: null
        };
      case 'pending':
        return {
          color: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
          icon: <Clock className="w-4 h-4" />,
          text: 'Refund Pending',
          amount: null
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  const refundStatus = getRefundStatus();
  const expiryDateObj = new Date(subscription.expiry_date);
  const startDateObj = new Date(subscription.start_date);

  return (
    <div className={`p-4 rounded-lg border-2 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <Badge className={`${config.color} border-0 font-medium`}>
          {config.icon}
          <span className="ml-2">{config.text}</span>
        </Badge>
        {refundStatus && (
          <Badge className={`${refundStatus.color} border-0 font-medium`}>
            {refundStatus.icon}
            <span className="ml-2">{refundStatus.text}</span>
          </Badge>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="font-medium">
            Started: {startDateObj.toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="font-medium">
            Expired: {expiryDateObj.toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Price:</span>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-foreground">{subscription.currency || 'PKR'} {calculatePrice()}</span>
            {subscription.custom_price && (
              <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">Custom</span>
            )}
          </div>
        </div>
        {refundStatus?.amount && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Refund Amount:</span>
            <span className="font-semibold text-green-600">{subscription.currency || 'PKR'} {refundStatus.amount.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const SubscriptionDashboard = () => {
  const { userAuthCode, subscriptions, signOut, refreshSubscriptions } = useSubscriptionAuth();
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pastSubscriptions, setPastSubscriptions] = useState<PastSubscription[]>([]);
  const [loadingPastSubscriptions, setLoadingPastSubscriptions] = useState(false);
  const [productCodes, setProductCodes] = useState<ProductCode[]>([]);
  const [loadingProductCodes, setLoadingProductCodes] = useState(false);

  const fetchPastSubscriptions = async () => {
    if (!userAuthCode) return;
    
    try {
      setLoadingPastSubscriptions(true);
      
      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .select(`
          *,
          product:products(
            id,
            name,
            slug,
            description,
            main_image_url,
            category
          ),
          subscription_refund_requests(
            id,
            subscription_id,
            reason,
            description,
            status,
            admin_notes,
            refund_amount,
            refund_method,
            processed_at,
            created_at
          )
        `)
        .eq('user_auth_code_id', userAuthCode.id)
        .in('status', ['expired', 'cancelled'])
        .order('expiry_date', { ascending: false });

      if (error) {
        console.error('Error fetching past subscriptions:', error);
        return;
      }

      setPastSubscriptions((data as unknown as PastSubscription[]) || []);
    } catch (error) {
      console.error('Error fetching past subscriptions:', error);
    } finally {
      setLoadingPastSubscriptions(false);
    }
  };

  const fetchProductCodes = async () => {
    if (!userAuthCode) return;
    
    try {
      setLoadingProductCodes(true);
      
      const { data, error } = await supabase
        .from('product_codes' as any)
        .select(`
          *,
          product:products(
            id,
            name,
            category
          )
        `)
        .eq('user_auth_code_id', userAuthCode.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProductCodes((data as any) || []);
    } catch (error) {
      console.error('Error fetching product codes:', error);
    } finally {
      setLoadingProductCodes(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSubscriptions();
    await fetchPastSubscriptions();
    await fetchProductCodes();
    setIsRefreshing(false);
  };

  const handleRequestRefund = (subscription: any) => {
    setSelectedSubscription(subscription);
    setShowRefundModal(true);
  };

  // Fetch past subscriptions and product codes when component mounts or user changes
  useEffect(() => {
    if (userAuthCode) {
      fetchPastSubscriptions();
      fetchProductCodes();
    }
  }, [userAuthCode]);

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const expiringSubscriptions = subscriptions.filter(sub => sub.status === 'expiring_soon');
  const expiredSubscriptions = subscriptions.filter(sub => sub.status === 'expired');

  if (!userAuthCode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/30 to-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-teal/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="bg-card/95 backdrop-blur-md shadow-xl border-b border-border/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-brand-teal to-brand-purple bg-clip-text text-transparent">Subscription Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your active subscriptions</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-border text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut} 
                className="border-border text-foreground hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* User Info */}
        <Card className="mb-8 bg-card/95 backdrop-blur-md shadow-xl border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-brand-teal/20 rounded-full flex items-center justify-center shadow-lg border border-primary/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-brand-teal/10 rounded-full animate-pulse"></div>
                <User className="w-7 h-7 text-primary relative z-10 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{userAuthCode.user_name}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  {userAuthCode.user_email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/95 backdrop-blur-md shadow-xl border-border/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 group">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mr-4 shadow-lg border border-primary/30 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-5 h-5 text-primary drop-shadow-[0_0_6px_rgba(34,197,94,0.4)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-3xl font-bold text-primary">{activeSubscriptions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-md shadow-xl border-border/50 hover:shadow-2xl hover:border-yellow-500/30 transition-all duration-300 group">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 rounded-full flex items-center justify-center mr-4 shadow-lg border border-yellow-500/30 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_6px_rgba(234,179,8,0.4)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                  <p className="text-3xl font-bold text-yellow-500">{expiringSubscriptions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-md shadow-xl border-border/50 hover:shadow-2xl hover:border-red-500/30 transition-all duration-300 group">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-full flex items-center justify-center mr-4 shadow-lg border border-red-500/30 group-hover:scale-110 transition-transform duration-300">
                  <XCircle className="w-5 h-5 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expired</p>
                  <p className="text-3xl font-bold text-red-500">{expiredSubscriptions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-md shadow-xl border-border/50 hover:shadow-2xl hover:border-muted/30 transition-all duration-300 group">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-muted/20 to-muted/10 rounded-full flex items-center justify-center mr-4 shadow-lg border border-muted/30 group-hover:scale-110 transition-transform duration-300">
                  <History className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Past Subscriptions</p>
                  <p className="text-3xl font-bold text-muted-foreground">{pastSubscriptions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex w-max min-w-full h-auto p-1 bg-card/95 backdrop-blur-md shadow-xl border-border/50 rounded-md">
              <TabsTrigger value="active" className="flex items-center justify-center space-x-2 text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">
                <CheckCircle className="w-4 h-4" />
                <span>Active Subscriptions</span>
                <Badge variant="secondary" className="ml-2">{activeSubscriptions.length + expiringSubscriptions.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center justify-center space-x-2 text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">
                <MessageCircle className="w-4 h-4" />
                <span>Pending Products</span>
                <Badge variant="secondary" className="ml-2">{productCodes.filter(pc => pc.status === 'pending').length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center justify-center space-x-2 text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">
                <History className="w-4 h-4" />
                <span>Past Subscriptions</span>
                <Badge variant="secondary" className="ml-2">{pastSubscriptions.length}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="mt-6">
            {subscriptions.length === 0 ? (
              <Card className="bg-card/95 backdrop-blur-md shadow-xl border-border/50">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-muted/20 to-muted/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-muted/30">
                    <CreditCard className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">No Active Subscriptions</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    You don't have any active subscriptions at the moment. Contact support to get started.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('mailto:support@toolsy.store')}
                    className="border-border text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {subscriptions.map((subscription) => (
                  <Card key={subscription.id} className="overflow-hidden bg-card/95 backdrop-blur-md shadow-xl border-border/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="flex flex-col h-full">
                        {/* Product Image */}
                        <div className="w-full h-48 flex-shrink-0">
                          {subscription.product?.main_image_url ? (
                            <img
                              src={subscription.product.main_image_url}
                              alt={subscription.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center">
                              <CreditCard className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 p-6 flex flex-col">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              {subscription.product?.name || 'Unknown Product'}
                            </h3>
                            <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                              {subscription.product?.description || 'No description available'}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="outline" className="border-border text-foreground text-xs">{subscription.product?.category}</Badge>
                              <Badge variant="secondary" className="capitalize bg-primary/20 text-primary border-primary/30 text-xs">
                                {subscription.subscription_type.replace('_', ' ')} Plan
                              </Badge>
                              <Badge variant="outline" className="capitalize border-border text-foreground text-xs">
                                {subscription.subscription_period.replace('_', ' ')}
                              </Badge>
                            </div>

                            <SubscriptionStatus 
                              status={subscription.status} 
                              expiryDate={subscription.expiry_date}
                              customPrice={subscription.custom_price}
                              subscriptionType={subscription.subscription_type}
                              subscriptionPeriod={subscription.subscription_period}
                              currency={(subscription as any).currency || 'PKR'}
                            />

                            {/* Login Credentials */}
                            <CredentialsDisplay 
                              username={subscription.username}
                              password={subscription.password}
                              className="mt-4"
                            />
                          </div>

                          {/* Actions */}
                          <div className="mt-4 flex flex-col space-y-2">
                            {subscription.status === 'active' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRequestRefund(subscription)}
                                className="border-border text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 w-full"
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                Request Refund
                              </Button>
                            )}
                            
                            {subscription.status === 'expiring_soon' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open('mailto:support@toolsy.store?subject=Subscription Renewal')}
                                className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-500/70 transition-all duration-300 w-full"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Renew Subscription
                              </Button>
                            )}

                            {subscription.status === 'expired' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open('mailto:support@toolsy.store?subject=Subscription Reactivation')}
                                className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500/70 transition-all duration-300 w-full"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reactivate
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {loadingProductCodes ? (
              <Card className="bg-card/95 backdrop-blur-md shadow-xl border-border/50">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-muted/20 to-muted/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-muted/30">
                    <RefreshCw className="w-10 h-10 text-muted-foreground animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Loading Product Codes...</h3>
                  <p className="text-muted-foreground">Fetching your pending product requests</p>
                </CardContent>
              </Card>
            ) : productCodes.length === 0 ? (
              <Card className="bg-card/95 backdrop-blur-md shadow-xl border-border/50">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-muted/20 to-muted/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-muted/30">
                    <MessageCircle className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Pending Products</h3>
                  <p className="text-muted-foreground">You don't have any pending product requests at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {productCodes.map((productCode) => (
                  <Card key={productCode.id} className="bg-card/95 backdrop-blur-md shadow-xl border-border/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {productCode.product.name}
                            {productCode.status === 'pending' && (
                              <Badge variant="outline" className="text-amber-600 border-amber-300">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending Approval
                              </Badge>
                            )}
                            {productCode.status === 'approved' && (
                              <Badge className="bg-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approved
                              </Badge>
                            )}
                            {productCode.status === 'rejected' && (
                              <Badge variant="destructive">
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejected
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {productCode.subscription_type} - {productCode.subscription_period}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {productCode.currency} {productCode.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(productCode.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Product Code:</span>
                          <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                            {productCode.product_code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(productCode.product_code)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        {productCode.status === 'pending' && (
                          <Alert>
                            <MessageCircle className="h-4 w-4" />
                            <AlertDescription>
                              This product code is pending admin approval. Send it to our WhatsApp for activation.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {productCode.status === 'rejected' && productCode.admin_notes && (
                          <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Rejected:</strong> {productCode.admin_notes}
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {productCode.status === 'approved' && (
                          <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              This product has been approved and should now appear in your active subscriptions.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {loadingPastSubscriptions ? (
              <Card className="bg-card/95 backdrop-blur-md shadow-xl border-border/50">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-muted/20 to-muted/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-muted/30">
                    <RefreshCw className="w-10 h-10 text-muted-foreground animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Loading Past Subscriptions</h3>
                  <p className="text-muted-foreground">Please wait while we fetch your subscription history...</p>
                </CardContent>
              </Card>
            ) : pastSubscriptions.length === 0 ? (
              <Card className="bg-card/95 backdrop-blur-md shadow-xl border-border/50">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-muted/20 to-muted/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-muted/30">
                    <History className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">No Past Subscriptions</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    You don't have any expired or cancelled subscriptions in your history.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {pastSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="overflow-hidden bg-card/95 backdrop-blur-md shadow-xl border-border/50 hover:shadow-2xl hover:border-muted/30 transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="flex flex-col h-full">
                        {/* Product Image */}
                        <div className="w-full h-48 flex-shrink-0">
                          {subscription.product?.main_image_url ? (
                            <img
                              src={subscription.product.main_image_url}
                              alt={subscription.product.name}
                              className="w-full h-full object-cover grayscale opacity-75"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center">
                              <CreditCard className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 p-6 flex flex-col">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              {subscription.product?.name || 'Unknown Product'}
                            </h3>
                            <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                              {subscription.product?.description || 'No description available'}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="outline" className="border-border text-foreground text-xs">{subscription.product?.category}</Badge>
                              <Badge variant="secondary" className="capitalize bg-muted/20 text-muted-foreground border-muted/30 text-xs">
                                {subscription.subscription_type.replace('_', ' ')} Plan
                              </Badge>
                              <Badge variant="outline" className="capitalize border-border text-foreground text-xs">
                                {subscription.subscription_period.replace('_', ' ')}
                              </Badge>
                            </div>

                            <PastSubscriptionStatus subscription={subscription} />

                            {/* Login Credentials */}
                            <CredentialsDisplay 
                              username={subscription.username}
                              password={subscription.password}
                              className="mt-4"
                            />
                          </div>

                          {/* Actions */}
                          <div className="mt-4 flex flex-col space-y-2">
                            {subscription.status === 'expired' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open('mailto:support@toolsy.store?subject=Subscription Reactivation')}
                                className="border-border text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 w-full"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reactivate
                              </Button>
                            )}
                            
                            {subscription.refund_requests && subscription.refund_requests.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open('mailto:support@toolsy.store?subject=Refund Status Inquiry')}
                                className="border-border text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 w-full"
                              >
                                <Receipt className="w-4 h-4 mr-2" />
                                View Refund Status
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="mt-8 bg-card/95 backdrop-blur-md shadow-xl border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Need Help?</CardTitle>
            <CardDescription className="text-muted-foreground">
              If you have any questions about your subscriptions or need assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => window.open('mailto:support@toolsy.store?subject=Subscription Support')}
                className="border-border text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('mailto:support@toolsy.store?subject=Refund Request')}
                className="border-border text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Request Refund
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Refund Modal */}
        {showRefundModal && selectedSubscription && (
          <SubscriptionRefundModal
            subscription={selectedSubscription}
            isOpen={showRefundModal}
            onClose={() => {
              setShowRefundModal(false);
              setSelectedSubscription(null);
            }}
          />
        )}
    </div>
  );
};
