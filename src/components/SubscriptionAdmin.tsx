import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CurrencyDisplay } from './CurrencyDisplay';
import { CurrencySelector } from './CurrencySelector';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Key, 
  User, 
  Mail, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Loader2,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { SubscriptionReceipt } from './SubscriptionReceipt';
import { SubscriptionExpiryTracker } from './SubscriptionExpiryTracker';
import { SalesAnalytics } from './SalesAnalytics';
import { AnalyticsBackfill } from './AnalyticsBackfill';

interface UserAuthCode {
  id: string;
  code: string;
  user_name: string;
  user_email: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

interface UserSubscription {
  id: string;
  user_auth_code_id: string;
  product_id: string;
  subscription_type: string;
  subscription_period: string;
  status: string;
  start_date: string;
  expiry_date: string;
  auto_renew: boolean;
  notes: string | null;
  custom_price: number | null;
  username: string | null;
  password: string | null;
  currency: string;
  created_at: string;
  user_auth_code?: UserAuthCode;
  product?: {
    id: string;
    name: string;
    category: string;
  };
}

interface SubscriptionRefundRequest {
  id: string;
  subscription_id: string;
  user_auth_code_id: string;
  reason: string;
  description: string;
  status: string;
  admin_notes: string | null;
  refund_amount: number | null;
  refund_method: string | null;
  created_at: string;
  subscription?: UserSubscription;
}

export const SubscriptionAdmin = () => {
  const [authCodes, setAuthCodes] = useState<UserAuthCode[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [refundRequests, setRefundRequests] = useState<SubscriptionRefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCodeModal, setShowCreateCodeModal] = useState(false);
  const [showCreateSubscriptionModal, setShowCreateSubscriptionModal] = useState(false);
  const [showEditSubscriptionModal, setShowEditSubscriptionModal] = useState(false);
  const [selectedRefundRequest, setSelectedRefundRequest] = useState<SubscriptionRefundRequest | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptSubscription, setReceiptSubscription] = useState<UserSubscription | null>(null);
  const { toast } = useToast();
  const { products } = useProducts();

  // Form states
  const [newCode, setNewCode] = useState({
    user_name: '',
    user_email: ''
  });

  const [newSubscription, setNewSubscription] = useState({
    user_auth_code_id: '',
    product_id: '',
    subscription_type: 'shared',
    subscription_period: '1_month',
    auto_renew: false,
    notes: '',
    custom_price: '',
    username: '',
    password: '',
    currency: 'NGN'
  });

  const [refundForm, setRefundForm] = useState({
    admin_notes: '',
    refund_amount: '',
    refund_method: ''
  });

  const [editSubscription, setEditSubscription] = useState({
    subscription_type: 'shared',
    subscription_period: '1_month',
    auto_renew: false,
    notes: '',
    custom_price: '',
    username: '',
    password: '',
    currency: 'NGN'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAuthCodes(),
        fetchSubscriptions(),
        fetchRefundRequests()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthCodes = async () => {
    const { data, error } = await supabase
      .from('user_auth_codes' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching auth codes:', error);
      return;
    }

    setAuthCodes((data as unknown as UserAuthCode[]) || []);
  };

  const fetchSubscriptions = async () => {
    const { data, error } = await supabase
      .from('user_subscriptions' as any)
      .select(`
        *,
        user_auth_code:user_auth_codes(*),
        product:products(id, name, category)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return;
    }

    setSubscriptions((data as unknown as UserSubscription[]) || []);
  };

  const fetchRefundRequests = async () => {
    const { data, error } = await supabase
      .from('subscription_refund_requests' as any)
      .select(`
        *,
        subscription:user_subscriptions(
          *,
          user_auth_code:user_auth_codes(*),
          product:products(id, name, category)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching refund requests:', error);
      return;
    }

    setRefundRequests((data as unknown as SubscriptionRefundRequest[]) || []);
  };

  const generateAuthCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createAuthCode = async () => {
    if (!newCode.user_name || !newCode.user_email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }


    try {
      const code = generateAuthCode();
      const { error } = await supabase
        .from('user_auth_codes' as any)
        .insert({
          code,
          user_name: newCode.user_name,
          user_email: newCode.user_email
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Error",
            description: "A user with this email already exists",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: `Authentication code created: ${code}`
      });

      setNewCode({ user_name: '', user_email: '' });
      setShowCreateCodeModal(false);
      fetchAuthCodes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create authentication code",
        variant: "destructive"
      });
    }
  };

  const createSubscription = async () => {
    if (!newSubscription.user_auth_code_id || !newSubscription.product_id || !newSubscription.subscription_period) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .insert({
          user_auth_code_id: newSubscription.user_auth_code_id,
          product_id: newSubscription.product_id,
          subscription_type: newSubscription.subscription_type,
          subscription_period: newSubscription.subscription_period,
          auto_renew: newSubscription.auto_renew,
          notes: newSubscription.notes || null,
          custom_price: newSubscription.custom_price ? parseFloat(newSubscription.custom_price) : null,
          username: newSubscription.username || null,
          password: newSubscription.password || null,
          currency: newSubscription.currency
        })
        .select(`
          *,
          user_auth_code:user_auth_codes(*),
          product:products(id, name, category)
        `);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription created successfully"
      });

      // Show receipt for the newly created subscription
      if (data && data[0]) {
        setReceiptSubscription(data[0] as unknown as UserSubscription);
        setShowReceipt(true);
      }

      setNewSubscription({
        user_auth_code_id: '',
        product_id: '',
        subscription_type: 'shared',
        subscription_period: '1_month',
        auto_renew: false,
        notes: '',
        custom_price: '',
        username: '',
        password: '',
        currency: 'NGN'
      });
      setShowCreateSubscriptionModal(false);
      fetchSubscriptions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive"
      });
    }
  };

  const updateRefundRequest = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('subscription_refund_requests' as any)
        .update({
          status,
          admin_notes: refundForm.admin_notes,
          refund_amount: refundForm.refund_amount ? parseFloat(refundForm.refund_amount) : null,
          refund_method: refundForm.refund_method || null,
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Refund request ${status} successfully`
      });

      setSelectedRefundRequest(null);
      setRefundForm({ admin_notes: '', refund_amount: '', refund_method: '' });
      fetchRefundRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update refund request",
        variant: "destructive"
      });
    }
  };

  const updateSubscription = async () => {
    if (!selectedSubscription) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions' as any)
        .update({
          subscription_type: editSubscription.subscription_type,
          subscription_period: editSubscription.subscription_period,
          auto_renew: editSubscription.auto_renew,
          notes: editSubscription.notes || null,
          custom_price: editSubscription.custom_price ? parseFloat(editSubscription.custom_price) : null,
          username: editSubscription.username || null,
          password: editSubscription.password || null,
          currency: editSubscription.currency
        })
        .eq('id', selectedSubscription.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription updated successfully"
      });

      setSelectedSubscription(null);
      setShowEditSubscriptionModal(false);
      setEditSubscription({
        subscription_type: 'shared',
        subscription_period: '1_month',
        auto_renew: false,
        notes: '',
        custom_price: '',
        username: '',
        password: '',
        currency: 'PKR'
      });
      fetchSubscriptions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive"
      });
    }
  };

  const deleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions' as any)
        .delete()
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription deleted successfully"
      });

      fetchSubscriptions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subscription",
        variant: "destructive"
      });
    }
  };

  const deleteAuthCode = async (authCodeId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete the auth code for ${userEmail}? This will also delete all associated subscriptions and cannot be undone.`)) return;

    try {
      // First, delete all subscriptions associated with this auth code
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions' as any)
        .delete()
        .eq('user_auth_code_id', authCodeId);

      if (subscriptionError) {
        console.error('Error deleting subscriptions:', subscriptionError);
        toast({
          title: "Warning",
          description: "Some subscriptions could not be deleted, but continuing with auth code deletion",
          variant: "destructive"
        });
      }

      // Then delete the auth code itself
      const { error: authCodeError } = await supabase
        .from('user_auth_codes' as any)
        .delete()
        .eq('id', authCodeId);

      if (authCodeError) throw authCodeError;

      toast({
        title: "Success",
        description: "User auth code and all associated subscriptions deleted successfully"
      });

      // Refresh both auth codes and subscriptions
      fetchAuthCodes();
      fetchSubscriptions();
    } catch (error) {
      console.error('Error deleting auth code:', error);
      toast({
        title: "Error",
        description: "Failed to delete auth code",
        variant: "destructive"
      });
    }
  };

  const openEditSubscription = (subscription: UserSubscription) => {
    setSelectedSubscription(subscription);
    setEditSubscription({
      subscription_type: subscription.subscription_type,
      subscription_period: subscription.subscription_period,
      auto_renew: subscription.auto_renew,
      notes: subscription.notes || '',
      custom_price: subscription.custom_price ? subscription.custom_price.toString() : '',
      username: subscription.username || '',
      password: subscription.password || '',
      currency: (subscription as any).currency || 'NGN'
    });
    setShowEditSubscriptionModal(true);
  };

  const showReceiptForSubscription = (subscription: UserSubscription) => {
    setReceiptSubscription(subscription);
    setShowReceipt(true);
  };

  // Helper function to calculate default price
  const calculateDefaultPrice = (subscriptionType: string, subscriptionPeriod: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expiring_soon': return <AlertTriangle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Group subscriptions by user
  const groupedSubscriptions = subscriptions.reduce((acc, subscription) => {
    const userId = subscription.user_auth_code_id;
    if (!acc[userId]) {
      acc[userId] = {
        user: subscription.user_auth_code,
        subscriptions: []
      };
    }
    acc[userId].subscriptions.push(subscription);
    return acc;
  }, {} as Record<string, { user: any; subscriptions: UserSubscription[] }>);

  const toggleUserExpansion = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
            <p className="text-muted-foreground">Manage user authentication codes, subscriptions, and refund requests</p>
          </div>
          <div className="flex items-center gap-4">
            <CurrencySelector variant="compact" showLabel={true} />
          </div>
        </div>
      </div>

      <Tabs defaultValue="auth-codes" className="w-full">
        <div className="overflow-x-auto scrollbar-hide">
          <TabsList className="inline-flex w-max min-w-full h-auto p-1 bg-muted rounded-md">
            <TabsTrigger value="auth-codes" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">Auth Codes ({authCodes.length})</TabsTrigger>
            <TabsTrigger value="subscriptions" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">Subscriptions ({subscriptions.length})</TabsTrigger>
            <TabsTrigger value="expiry-tracker" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">Expiry Tracker</TabsTrigger>
            <TabsTrigger value="sales-analytics" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">Sales Analytics</TabsTrigger>
            <TabsTrigger value="refunds" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">Refund Requests ({refundRequests.length})</TabsTrigger>
          </TabsList>
        </div>

        {/* Auth Codes Tab */}
        <TabsContent value="auth-codes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Authentication Codes</h2>
            <Button onClick={() => setShowCreateCodeModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Code
            </Button>
          </div>

          <div className="grid gap-4">
            {authCodes.map((code) => (
              <Card key={code.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Key className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono font-semibold">{code.code}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {code.user_name}
                          </span>
                          <span className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {code.user_email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={code.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Permanent Code
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAuthCode(code.id, code.user_email)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        title="Delete User & Auth Code"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">User Subscriptions</h2>
            <Button onClick={() => setShowCreateSubscriptionModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Subscription
            </Button>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedSubscriptions).map(([userId, { user, subscriptions: userSubscriptions }]) => (
              <Card key={userId} className="bg-card/95 backdrop-blur-md shadow-xl border-border/50">
                <CardContent className="p-0">
                  {/* User Header - Clickable */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-muted/20 transition-colors duration-200"
                    onClick={() => toggleUserExpansion(userId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-brand-teal/20 rounded-full flex items-center justify-center shadow-lg border border-primary/30">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{user?.user_name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {user?.user_email}
                            </span>
                            <span className="flex items-center">
                              <Key className="w-4 h-4 mr-1" />
                              {user?.code}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {userSubscriptions.length} subscription{userSubscriptions.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={user?.is_active ? 'bg-primary/20 text-primary border-primary/30' : 'bg-muted/20 text-muted-foreground border-muted/30'}>
                          {user?.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className={`transform transition-transform duration-200 ${expandedUser === userId ? 'rotate-180' : ''}`}>
                          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Subscriptions - Expandable */}
                  {expandedUser === userId && (
                    <div className="border-t border-border/50 bg-muted/5">
                      <div className="p-4 space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Active Subscriptions</h4>
                        {userSubscriptions.map((subscription) => (
                          <div key={subscription.id} className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/30">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-brand-teal/20 to-brand-purple/20 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-brand-teal">
                                  {subscription.product?.name?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{subscription.product?.name || 'Unknown Product'}</p>
                                 <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                   <span className="capitalize">{subscription.subscription_type.replace('_', ' ')}</span>
                                   <span className="capitalize">{subscription.subscription_period.replace('_', ' ')}</span>
                                   <span className="flex items-center">
                                     <Calendar className="w-3 h-3 mr-1" />
                                     Expires: {new Date(subscription.expiry_date).toLocaleDateString()}
                                   </span>
                                   <span className="flex items-center">
                                     <span className="text-sm font-medium">
                                       {(subscription as any).currency || 'NGN'} {subscription.custom_price ? subscription.custom_price : parseFloat(calculateDefaultPrice(subscription.subscription_type, subscription.subscription_period))}
                                     </span>
                                     {subscription.custom_price && (
                                       <span className="ml-1 text-xs text-blue-500 bg-blue-50 px-1 py-0.5 rounded">Custom</span>
                                     )}
                                   </span>
                                 </div>
                                 {/* Expiry Warning */}
                                 {subscription.status === 'expiring_soon' && (
                                   <div className="flex items-center mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                     <AlertTriangle className="w-3 h-3 mr-1" />
                                     <span>Expires in {Math.ceil((new Date(subscription.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</span>
                                   </div>
                                 )}
                                 {subscription.status === 'expired' && (
                                   <div className="flex items-center mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                     <XCircle className="w-3 h-3 mr-1" />
                                     <span>Expired {Math.ceil((new Date().getTime() - new Date(subscription.expiry_date).getTime()) / (1000 * 60 * 60 * 24))} days ago</span>
                                   </div>
                                 )}
                              </div>
                            </div>
                             <div className="flex items-center space-x-2">
                               <Badge className={getStatusColor(subscription.status)}>
                                 {getStatusIcon(subscription.status)}
                                 <span className="ml-1 capitalize text-xs">{subscription.status.replace('_', ' ')}</span>
                               </Badge>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   showReceiptForSubscription(subscription);
                                 }}
                                 className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                 title="View Receipt"
                               >
                                 <FileText className="w-3 h-3" />
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   openEditSubscription(subscription);
                                 }}
                                 className="h-8 w-8 p-0"
                                 title="Edit Subscription"
                               >
                                 <Edit className="w-3 h-3" />
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   deleteSubscription(subscription.id);
                                 }}
                                 className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                 title="Delete Subscription"
                               >
                                 <Trash2 className="w-3 h-3" />
                               </Button>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Expiry Tracker Tab */}
        <TabsContent value="expiry-tracker" className="space-y-4">
          <SubscriptionExpiryTracker />
        </TabsContent>

        {/* Sales Analytics Tab */}
        <TabsContent value="sales-analytics" className="space-y-4">
          <div className="space-y-6">
            <AnalyticsBackfill />
            <SalesAnalytics />
          </div>
        </TabsContent>

        {/* Refund Requests Tab */}
        <TabsContent value="refunds" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Refund Requests</h2>
            <Button variant="outline" onClick={fetchRefundRequests}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {refundRequests.map((request) => (
              <Card key={request.id} className="cursor-pointer" onClick={() => setSelectedRefundRequest(request)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{request.subscription?.product?.name || 'Unknown Product'}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{request.subscription?.user_auth_code?.user_name}</span>
                          <span className="capitalize">{request.reason.replace('-', ' ')}</span>
                          <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Auth Code Modal */}
      <Dialog open={showCreateCodeModal} onOpenChange={setShowCreateCodeModal}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] p-0 flex flex-col">
          {/* Fixed Header */}
          <DialogHeader className="p-6 pb-4 border-b border-border/50 flex-shrink-0">
            <DialogTitle className="text-xl">Create Authentication Code</DialogTitle>
            <DialogDescription>
              Generate a new authentication code for a user
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
            <div>
              <Label htmlFor="user_name" className="font-medium">User Name</Label>
              <Input
                id="user_name"
                value={newCode.user_name}
                onChange={(e) => setNewCode({ ...newCode, user_name: e.target.value })}
                placeholder="Enter user's name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="user_email" className="font-medium">User Email</Label>
              <Input
                id="user_email"
                type="email"
                value={newCode.user_email}
                onChange={(e) => setNewCode({ ...newCode, user_email: e.target.value })}
                placeholder="Enter user's email"
                className="mt-2"
              />
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="p-6 pt-4 border-t border-border/50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button variant="outline" onClick={() => setShowCreateCodeModal(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={createAuthCode} className="w-full sm:w-auto">
                Create Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Subscription Modal */}
      <Dialog open={showCreateSubscriptionModal} onOpenChange={setShowCreateSubscriptionModal}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] p-0 flex flex-col">
          {/* Fixed Header */}
          <DialogHeader className="p-6 pb-4 border-b border-border/50 flex-shrink-0">
            <DialogTitle className="text-xl">Create Subscription</DialogTitle>
            <DialogDescription>
              Create a new subscription for a user
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="auth_code" className="font-medium">Authentication Code</Label>
                <Select value={newSubscription.user_auth_code_id} onValueChange={(value) => setNewSubscription({ ...newSubscription, user_auth_code_id: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select authentication code" />
                  </SelectTrigger>
                  <SelectContent>
                    {authCodes.filter(code => code.is_active).map((code) => (
                      <SelectItem key={code.id} value={code.id}>
                        {code.code} - {code.user_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="product" className="font-medium">Product</Label>
                <Select value={newSubscription.product_id} onValueChange={(value) => setNewSubscription({ ...newSubscription, product_id: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subscription_type" className="font-medium">Subscription Type</Label>
                <Select value={newSubscription.subscription_type} onValueChange={(value) => setNewSubscription({ ...newSubscription, subscription_type: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shared">Shared</SelectItem>
                    <SelectItem value="semi_private">Semi Private</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subscription_period" className="font-medium">Subscription Period</Label>
                <Select value={newSubscription.subscription_period} onValueChange={(value) => setNewSubscription({ ...newSubscription, subscription_period: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_month">1 Month</SelectItem>
                    <SelectItem value="3_months">3 Months</SelectItem>
                    <SelectItem value="6_months">6 Months</SelectItem>
                    <SelectItem value="1_year">1 Year</SelectItem>
                    <SelectItem value="2_years">2 Years</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency" className="font-medium">Currency</Label>
                <Select value={newSubscription.currency} onValueChange={(value) => setNewSubscription({ ...newSubscription, currency: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN (Nigerian Naira)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="custom_price" className="font-medium">Custom Price (Optional)</Label>
                <div className="space-y-2 mt-2">
                  <Input
                    id="custom_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newSubscription.custom_price}
                    onChange={(e) => setNewSubscription({ ...newSubscription, custom_price: e.target.value })}
                    placeholder="Enter custom price (leave empty for default)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Default price: <CurrencyDisplay pkrAmount={parseFloat(calculateDefaultPrice(newSubscription.subscription_type, newSubscription.subscription_period))} size="sm" />
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="font-medium">Admin Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newSubscription.notes}
                onChange={(e) => setNewSubscription({ ...newSubscription, notes: e.target.value })}
                placeholder="Add any notes about this subscription..."
                rows={3}
                className="mt-2 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username" className="font-medium">Username (Optional)</Label>
                <Input
                  id="username"
                  type="text"
                  value={newSubscription.username}
                  onChange={(e) => setNewSubscription({ ...newSubscription, username: e.target.value })}
                  placeholder="Enter account username"
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Account username for this subscription
                </p>
              </div>

              <div>
                <Label htmlFor="password" className="font-medium">Password (Optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={newSubscription.password}
                  onChange={(e) => setNewSubscription({ ...newSubscription, password: e.target.value })}
                  placeholder="Enter account password"
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Account password for this subscription
                </p>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="p-6 pt-4 border-t border-border/50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button variant="outline" onClick={() => setShowCreateSubscriptionModal(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={createSubscription} className="w-full sm:w-auto">
                Create Subscription
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund Request Details Modal */}
      {selectedRefundRequest && (
        <Dialog open={!!selectedRefundRequest} onOpenChange={() => setSelectedRefundRequest(null)}>
          <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] p-0 flex flex-col">
            {/* Fixed Header */}
            <DialogHeader className="p-6 pb-4 border-b border-border/50 flex-shrink-0">
              <DialogTitle className="text-xl">Refund Request Details</DialogTitle>
              <DialogDescription>
                Review and process the refund request
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              <div className="bg-muted/20 p-4 rounded-lg border border-border/50">
                <h4 className="font-semibold mb-3">Request Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-primary font-medium">Product:</span>
                    <p className="text-foreground mt-1">{selectedRefundRequest.subscription?.product?.name}</p>
                  </div>
                  <div>
                    <span className="text-primary font-medium">User:</span>
                    <p className="text-foreground mt-1">{selectedRefundRequest.subscription?.user_auth_code?.user_name}</p>
                  </div>
                  <div>
                    <span className="text-primary font-medium">Reason:</span>
                    <p className="text-foreground mt-1 capitalize">{selectedRefundRequest.reason.replace('-', ' ')}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-primary font-medium">Description:</span>
                    <p className="text-muted-foreground bg-muted/30 p-3 rounded mt-1">{selectedRefundRequest.description}</p>
                  </div>
                </div>
              </div>

              {selectedRefundRequest.status === 'pending' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="admin_notes" className="font-medium">Admin Notes</Label>
                    <Textarea
                      id="admin_notes"
                      value={refundForm.admin_notes}
                      onChange={(e) => setRefundForm({ ...refundForm, admin_notes: e.target.value })}
                      placeholder="Add notes about this request..."
                      rows={3}
                      className="mt-2 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="refund_amount" className="font-medium">Refund Amount</Label>
                      <Input
                        id="refund_amount"
                        type="number"
                        value={refundForm.refund_amount}
                        onChange={(e) => setRefundForm({ ...refundForm, refund_amount: e.target.value })}
                        placeholder="0.00"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="refund_method" className="font-medium">Refund Method</Label>
                      <Select value={refundForm.refund_method} onValueChange={(value) => setRefundForm({ ...refundForm, refund_method: value })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="original_payment">Original Payment Method</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="store_credit">Store Credit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            {selectedRefundRequest.status === 'pending' && (
              <div className="p-6 pt-4 border-t border-border/50 flex-shrink-0">
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => updateRefundRequest(selectedRefundRequest.id, 'rejected')}
                    className="w-full sm:w-auto"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => updateRefundRequest(selectedRefundRequest.id, 'approved')}
                    className="w-full sm:w-auto"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Subscription Modal */}
      {selectedSubscription && (
        <Dialog open={showEditSubscriptionModal} onOpenChange={() => setShowEditSubscriptionModal(false)}>
          <DialogContent className="bg-card border-border max-w-2xl w-[95vw] max-h-[90vh] p-0 flex flex-col">
            {/* Fixed Header */}
            <DialogHeader className="p-6 pb-4 border-b border-border/50 flex-shrink-0">
              <DialogTitle className="text-foreground text-xl">Edit Subscription</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update subscription details for {selectedSubscription.user_auth_code?.user_name}
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              <div className="bg-muted/20 p-4 rounded-lg border border-border/50">
                <h4 className="font-semibold mb-3 text-foreground">Current Subscription</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-primary font-medium">Product:</span>
                    <p className="text-foreground mt-1">{selectedSubscription.product?.name}</p>
                  </div>
                  <div>
                    <span className="text-primary font-medium">User:</span>
                    <p className="text-foreground mt-1">{selectedSubscription.user_auth_code?.user_name}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-primary font-medium">Email:</span>
                    <p className="text-foreground mt-1 break-all">{selectedSubscription.user_auth_code?.user_email}</p>
                  </div>
                  <div>
                    <span className="text-primary font-medium">Current Period:</span>
                    <p className="text-foreground mt-1 capitalize">{selectedSubscription.subscription_period.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-primary font-medium">Expires:</span>
                    <p className="text-foreground mt-1">{new Date(selectedSubscription.expiry_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_subscription_type" className="text-foreground font-medium">Subscription Type</Label>
                  <Select value={editSubscription.subscription_type} onValueChange={(value) => setEditSubscription({ ...editSubscription, subscription_type: value })}>
                    <SelectTrigger className="bg-input border-border text-foreground focus:border-primary focus:ring-primary/50 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="shared" className="text-foreground focus:bg-primary/10">Shared</SelectItem>
                      <SelectItem value="semi_private" className="text-foreground focus:bg-primary/10">Semi Private</SelectItem>
                      <SelectItem value="private" className="text-foreground focus:bg-primary/10">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit_subscription_period" className="text-foreground font-medium">Subscription Period</Label>
                  <Select value={editSubscription.subscription_period} onValueChange={(value) => setEditSubscription({ ...editSubscription, subscription_period: value })}>
                    <SelectTrigger className="bg-input border-border text-foreground focus:border-primary focus:ring-primary/50 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="1_month" className="text-foreground focus:bg-primary/10">1 Month</SelectItem>
                      <SelectItem value="3_months" className="text-foreground focus:bg-primary/10">3 Months</SelectItem>
                      <SelectItem value="6_months" className="text-foreground focus:bg-primary/10">6 Months</SelectItem>
                      <SelectItem value="1_year" className="text-foreground focus:bg-primary/10">1 Year</SelectItem>
                      <SelectItem value="2_years" className="text-foreground focus:bg-primary/10">2 Years</SelectItem>
                      <SelectItem value="lifetime" className="text-foreground focus:bg-primary/10">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_currency" className="text-foreground font-medium">Currency</Label>
                  <Select value={editSubscription.currency} onValueChange={(value) => setEditSubscription({ ...editSubscription, currency: value })}>
                    <SelectTrigger className="bg-input border-border text-foreground focus:border-primary focus:ring-primary/50 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="NGN" className="text-foreground focus:bg-primary/10">NGN (Nigerian Naira)</SelectItem>
                      <SelectItem value="USD" className="text-foreground focus:bg-primary/10">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR" className="text-foreground focus:bg-primary/10">EUR (Euro)</SelectItem>
                      <SelectItem value="GBP" className="text-foreground focus:bg-primary/10">GBP (British Pound)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit_custom_price" className="text-foreground font-medium">Custom Price</Label>
                  <div className="space-y-2 mt-2">
                    <Input
                      id="edit_custom_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editSubscription.custom_price}
                      onChange={(e) => setEditSubscription({ ...editSubscription, custom_price: e.target.value })}
                      placeholder="Enter custom price (leave empty for default)"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
                    />
                    <p className="text-sm text-muted-foreground">
                      Default price: <CurrencyDisplay pkrAmount={parseFloat(calculateDefaultPrice(editSubscription.subscription_type, editSubscription.subscription_period))} size="sm" />
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="edit_notes" className="text-foreground font-medium">Admin Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={editSubscription.notes}
                  onChange={(e) => setEditSubscription({ ...editSubscription, notes: e.target.value })}
                  placeholder="Add any notes about this subscription..."
                  rows={3}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50 mt-2 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_username" className="text-foreground font-medium">Username (Optional)</Label>
                  <Input
                    id="edit_username"
                    type="text"
                    value={editSubscription.username}
                    onChange={(e) => setEditSubscription({ ...editSubscription, username: e.target.value })}
                    placeholder="Enter account username"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50 mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Account username for this subscription
                  </p>
                </div>

                <div>
                  <Label htmlFor="edit_password" className="text-foreground font-medium">Password (Optional)</Label>
                  <Input
                    id="edit_password"
                    type="password"
                    value={editSubscription.password}
                    onChange={(e) => setEditSubscription({ ...editSubscription, password: e.target.value })}
                    placeholder="Enter account password"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50 mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Account password for this subscription
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-muted/10 rounded-lg">
                <input
                  type="checkbox"
                  id="edit_auto_renew"
                  checked={editSubscription.auto_renew}
                  onChange={(e) => setEditSubscription({ ...editSubscription, auto_renew: e.target.checked })}
                  className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary focus:ring-2"
                />
                <Label htmlFor="edit_auto_renew" className="text-foreground font-medium cursor-pointer">Auto Renew</Label>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-6 pt-4 border-t border-border/50 flex-shrink-0">
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditSubscriptionModal(false)}
                  className="border-border text-foreground hover:bg-muted/50 hover:border-border/80 transition-all duration-300 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={updateSubscription}
                  className="bg-gradient-to-r from-primary to-brand-teal hover:from-primary/90 hover:to-brand-teal/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                >
                  Update Subscription
                </Button>
              </div>
            </div>
          </DialogContent>
         </Dialog>
       )}

       {/* Receipt Modal */}
       {showReceipt && receiptSubscription && (
         <SubscriptionReceipt 
           subscription={receiptSubscription} 
           onClose={() => {
             setShowReceipt(false);
             setReceiptSubscription(null);
           }} 
         />
       )}
     </div>
   );
 };
