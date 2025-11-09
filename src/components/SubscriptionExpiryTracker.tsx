import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter,
  Search,
  Calendar,
  User,
  Mail,
  Key,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserAuthCode {
  id: string;
  code: string;
  user_name: string;
  user_email: string;
  is_active: boolean;
  created_at: string;
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
  created_at: string;
  user_auth_code?: UserAuthCode;
  product?: {
    id: string;
    name: string;
    category: string;
  };
}

interface ExpiryStats {
  total: number;
  active: number;
  expiring_soon: number;
  expired: number;
}

export const SubscriptionExpiryTracker = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ExpiryStats>({ total: 0, active: 0, expiring_soon: 0, expired: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('expiry_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    filterAndSortSubscriptions();
  }, [subscriptions, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      
      // First, update subscription statuses to ensure they're current
      await supabase.rpc('update_subscription_statuses');
      
      // Then fetch the updated subscriptions
      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .select(`
          *,
          user_auth_code:user_auth_codes(*),
          product:products(id, name, category)
        `)
        .order('expiry_date', { ascending: true });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        toast({
          title: "Error",
          description: "Failed to fetch subscription data",
          variant: "destructive"
        });
        return;
      }

      const subscriptionData = (data as unknown as UserSubscription[]) || [];
      setSubscriptions(subscriptionData);
      calculateStats(subscriptionData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (subscriptionData: UserSubscription[]) => {
    const stats = subscriptionData.reduce((acc, sub) => {
      acc.total++;
      switch (sub.status) {
        case 'active':
          acc.active++;
          break;
        case 'expiring_soon':
          acc.expiring_soon++;
          break;
        case 'expired':
          acc.expired++;
          break;
      }
      return acc;
    }, { total: 0, active: 0, expiring_soon: 0, expired: 0 });
    setStats(stats);
  };

  const filterAndSortSubscriptions = () => {
    let filtered = [...subscriptions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.user_auth_code?.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user_auth_code?.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user_auth_code?.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'expiry_date':
          aValue = new Date(a.expiry_date).getTime();
          bValue = new Date(b.expiry_date).getTime();
          break;
        case 'user_name':
          aValue = a.user_auth_code?.user_name || '';
          bValue = b.user_auth_code?.user_name || '';
          break;
        case 'product_name':
          aValue = a.product?.name || '';
          bValue = b.product?.name || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.expiry_date).getTime();
          bValue = new Date(b.expiry_date).getTime();
      }

      if (sortBy === 'expiry_date' || sortBy === 'status') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });

    setFilteredSubscriptions(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'expiring_soon': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expiring_soon': return <AlertTriangle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryIndicator = (expiryDate: string, status: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    
    if (status === 'expired') {
      return (
        <div className="flex items-center text-red-600">
          <XCircle className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Expired {Math.abs(days)} days ago</span>
        </div>
      );
    } else if (status === 'expiring_soon') {
      return (
        <div className="flex items-center text-orange-600">
          <AlertTriangle className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Expires in {days} days</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Expires in {days} days</span>
        </div>
      );
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getSortIcon = () => {
    switch (sortOrder) {
      case 'asc': return <TrendingUp className="w-4 h-4" />;
      case 'desc': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const sendRenewalReminder = async (subscription: UserSubscription) => {
    try {
      // This would typically integrate with an email service
      // For now, we'll just show a success message
      toast({
        title: "Renewal Reminder Sent",
        description: `Reminder sent to ${subscription.user_auth_code?.user_email} for ${subscription.product?.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send renewal reminder",
        variant: "destructive"
      });
    }
  };

  const sendBulkRenewalReminders = async () => {
    const expiringSubscriptions = subscriptions.filter(sub => 
      sub.status === 'expiring_soon' || sub.status === 'expired'
    );
    
    if (expiringSubscriptions.length === 0) {
      toast({
        title: "No Reminders Needed",
        description: "No subscriptions are currently expiring or expired",
      });
      return;
    }

    try {
      // This would typically integrate with an email service
      // For now, we'll just show a success message
      toast({
        title: "Bulk Reminders Sent",
        description: `Renewal reminders sent to ${expiringSubscriptions.length} users`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send bulk renewal reminders",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription Expiry Tracker</h2>
          <p className="text-muted-foreground">Monitor subscription expiry dates and renewal needs</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={sendBulkRenewalReminders} 
            variant="outline" 
            size="sm"
            disabled={stats.expiring_soon + stats.expired === 0}
          >
            <Mail className="w-4 h-4 mr-2" />
            Send Bulk Reminders ({stats.expiring_soon + stats.expired})
          </Button>
          <Button onClick={fetchSubscriptions} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Subscriptions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{stats.expiring_soon}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by user name, email, product, or auth code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expiry_date">Expiry Date</SelectItem>
                  <SelectItem value="user_name">User Name</SelectItem>
                  <SelectItem value="product_name">Product Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="px-3"
              >
                {getSortIcon()}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <div className="space-y-3">
        {filteredSubscriptions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No subscriptions found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredSubscriptions.map((subscription) => (
            <Card 
              key={subscription.id} 
              className={`transition-all duration-200 hover:shadow-md ${
                subscription.status === 'expired' ? 'border-red-200 bg-red-50/30' :
                subscription.status === 'expiring_soon' ? 'border-orange-200 bg-orange-50/30' :
                'border-green-200 bg-green-50/30'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      subscription.status === 'expired' ? 'bg-red-100' :
                      subscription.status === 'expiring_soon' ? 'bg-orange-100' :
                      'bg-green-100'
                    }`}>
                      <User className={`w-6 h-6 ${
                        subscription.status === 'expired' ? 'text-red-600' :
                        subscription.status === 'expiring_soon' ? 'text-orange-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-lg">{subscription.user_auth_code?.user_name}</h3>
                        <Badge className={getStatusColor(subscription.status)}>
                          {getStatusIcon(subscription.status)}
                          <span className="ml-1 capitalize">{subscription.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {subscription.user_auth_code?.user_email}
                        </span>
                        <span className="flex items-center">
                          <Key className="w-4 h-4 mr-1" />
                          {subscription.user_auth_code?.code}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="font-medium text-foreground">
                          {subscription.product?.name || 'Unknown Product'}
                        </span>
                        <span className="text-muted-foreground">
                          {subscription.subscription_type.replace('_', ' ')} • {subscription.subscription_period.replace('_', ' ')}
                        </span>
                        {subscription.custom_price && (
                          <span className="text-blue-600 font-medium">
                            ${subscription.custom_price.toFixed(2)} (Custom)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="mb-2">
                      {getExpiryIndicator(subscription.expiry_date, subscription.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expires: {new Date(subscription.expiry_date).toLocaleDateString()}
                    </div>
                    {subscription.auto_renew && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Auto Renew
                      </Badge>
                    )}
                    {(subscription.status === 'expiring_soon' || subscription.status === 'expired') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendRenewalReminder(subscription)}
                        className="mt-2 text-xs"
                      >
                        Send Reminder
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
