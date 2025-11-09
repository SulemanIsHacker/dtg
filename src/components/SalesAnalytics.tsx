import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  RefreshCw,
  Download,
  BarChart3,
  LineChart,
  PieChart,
  Loader2,
  AlertCircle,
  Wrench
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';
import { CurrencyDisplay, AnalyticsDisplay } from './CurrencyDisplay';
import { CurrencySelector } from './CurrencySelector';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface SalesData {
  period_start: string;
  period_end: string;
  total_revenue: number;
  total_subscriptions: number;
  total_refunds: number;
  total_refund_count: number;
  active_subscriptions: number;
  expired_subscriptions: number;
  product_breakdown: any[];
}

interface ProductSummary {
  product_id: string;
  product_name: string;
  total_revenue: number;
  total_subscriptions: number;
  total_refunds: number;
  net_revenue: number;
  active_subscriptions: number;
  expired_subscriptions: number;
  subscription_types: any[];
}

interface AnalyticsSummary {
  total_revenue: number;
  total_subscriptions: number;
  total_refunds: number;
  net_revenue: number;
  active_subscriptions: number;
  expired_subscriptions: number;
  refund_rate: number;
  average_order_value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const SalesAnalytics = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productSummary, setProductSummary] = useState<ProductSummary[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'custom'>('30d');
  const [groupBy, setGroupBy] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, groupBy, customStartDate, customEndDate]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    switch (dateRange) {
      case '7d':
        startDate = startOfDay(subDays(now, 7));
        break;
      case '30d':
        startDate = startOfDay(subDays(now, 30));
        break;
      case '90d':
        startDate = startOfDay(subDays(now, 90));
        break;
      case '1y':
        startDate = startOfDay(subYears(now, 1));
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = startOfDay(new Date(customStartDate));
          endDate = endOfDay(new Date(customEndDate));
        } else {
          startDate = startOfDay(subDays(now, 30));
        }
        break;
      default:
        startDate = startOfDay(subDays(now, 30));
    }

    return { startDate, endDate };
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();

      // Fetch sales analytics data
      const { data: salesDataResult, error: salesError } = await supabase
        .rpc('get_sales_analytics' as any, {
          p_start_date: format(startDate, 'yyyy-MM-dd'),
          p_end_date: format(endDate, 'yyyy-MM-dd'),
          p_group_by_period: groupBy
        });

      if (salesError) {
        console.error('Error fetching sales data:', salesError);
        throw salesError;
      }

      // Fetch product summary data
      const { data: productDataResult, error: productError } = await supabase
        .rpc('get_product_sales_summary' as any, {
          p_start_date: format(startDate, 'yyyy-MM-dd'),
          p_end_date: format(endDate, 'yyyy-MM-dd')
        });

      if (productError) {
        console.error('Error fetching product data:', productError);
        throw productError;
      }

      const salesData = (salesDataResult as SalesData[]) || [];
      const productData = (productDataResult as ProductSummary[]) || [];
      
      // Debug logging (development only)
      if (import.meta.env.DEV) {
        console.log('Sales Data from get_sales_analytics:', salesData);
        console.log('Product Data from get_product_sales_summary:', productData);
      }
      
      setSalesData(salesData);
      setProductSummary(productData);
      
      // Calculate summary statistics from sales data
      const totalRevenue = salesData.reduce((sum: number, item: SalesData) => sum + item.total_revenue, 0);
      const totalSubscriptions = salesData.reduce((sum: number, item: SalesData) => sum + item.total_subscriptions, 0);
      const totalRefunds = salesData.reduce((sum: number, item: SalesData) => sum + item.total_refunds, 0);
      const activeSubscriptions = salesData.reduce((sum: number, item: SalesData) => sum + item.active_subscriptions, 0);
      const expiredSubscriptions = salesData.reduce((sum: number, item: SalesData) => sum + item.expired_subscriptions, 0);
      
      // Also calculate from product data as a cross-check
      const productTotalRevenue = productData.reduce((sum: number, item: ProductSummary) => sum + item.total_revenue, 0);
      const productTotalSubscriptions = productData.reduce((sum: number, item: ProductSummary) => sum + item.total_subscriptions, 0);
      const productTotalRefunds = productData.reduce((sum: number, item: ProductSummary) => sum + item.total_refunds, 0);
      const productActiveSubscriptions = productData.reduce((sum: number, item: ProductSummary) => sum + item.active_subscriptions, 0);
      const productExpiredSubscriptions = productData.reduce((sum: number, item: ProductSummary) => sum + item.expired_subscriptions, 0);
      
      // Use product data if it's more accurate (has more records)
      const useProductData = productData.length > salesData.length || 
                            (productData.length > 0 && salesData.length === 0);
      
      // Debug logging (can be removed in production)
      console.log('Summary calculation from sales data:', {
        totalRevenue,
        totalSubscriptions,
        totalRefunds,
        activeSubscriptions,
        expiredSubscriptions
      });
      
      console.log('Summary calculation from product data:', {
        productTotalRevenue,
        productTotalSubscriptions,
        productTotalRefunds,
        productActiveSubscriptions,
        productExpiredSubscriptions
      });
      
      console.log('Using product data for summary:', useProductData);

      // Use the more accurate data source for summary
      const finalRevenue = useProductData ? productTotalRevenue : totalRevenue;
      const finalSubscriptions = useProductData ? productTotalSubscriptions : totalSubscriptions;
      const finalRefunds = useProductData ? productTotalRefunds : totalRefunds;
      const finalActiveSubscriptions = useProductData ? productActiveSubscriptions : activeSubscriptions;
      const finalExpiredSubscriptions = useProductData ? productExpiredSubscriptions : expiredSubscriptions;

      setSummary({
        total_revenue: finalRevenue,
        total_subscriptions: finalSubscriptions,
        total_refunds: finalRefunds,
        net_revenue: finalRevenue - finalRefunds,
        active_subscriptions: finalActiveSubscriptions,
        expired_subscriptions: finalExpiredSubscriptions,
        refund_rate: finalRevenue > 0 ? (finalRefunds / finalRevenue) * 100 : 0,
        average_order_value: finalSubscriptions > 0 ? finalRevenue / finalSubscriptions : 0
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove the old formatCurrency function - we'll use CurrencyDisplay component instead

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    switch (groupBy) {
      case 'daily':
        return format(date, 'MMM dd');
      case 'weekly':
        return format(date, 'MMM dd');
      case 'monthly':
        return format(date, 'MMM yyyy');
      case 'yearly':
        return format(date, 'yyyy');
      default:
        return format(date, 'MMM dd');
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Revenue', 'Subscriptions', 'Refunds', 'Net Revenue', 'Active', 'Expired'].join(','),
      ...salesData.map(item => [
        formatDate(item.period_start),
        item.total_revenue,
        item.total_subscriptions,
        item.total_refunds,
        item.total_revenue - item.total_refunds,
        item.active_subscriptions,
        item.expired_subscriptions
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Sales data has been exported to CSV"
    });
  };

  const fixConsistency = async () => {
    try {
      setLoading(true);
      
      // Call the auto-fix function
      const { data, error } = await supabase.rpc('auto_fix_sales_analytics_consistency' as any);
      
      if (error) {
        console.error('Error fixing consistency:', error);
        throw error;
      }
      
      toast({
        title: "Consistency Fixed",
        description: data || "Sales analytics data has been synchronized with subscription data",
      });
      
      // Refresh the data
      await fetchAnalytics();
      
    } catch (error) {
      console.error('Error fixing consistency:', error);
      toast({
        title: "Error",
        description: "Failed to fix data consistency",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = salesData.map(item => ({
    date: formatDate(item.period_start),
    revenue: item.total_revenue,
    subscriptions: item.total_subscriptions,
    refunds: item.total_refunds,
    netRevenue: item.total_revenue - item.total_refunds,
    active: item.active_subscriptions,
    expired: item.expired_subscriptions
  }));

  const productChartData = productSummary.map(item => ({
    name: item.product_name,
    revenue: item.total_revenue,
    subscriptions: item.total_subscriptions,
    netRevenue: item.net_revenue
  }));

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
          <h2 className="text-2xl font-bold">Sales Analytics</h2>
          <p className="text-muted-foreground">Track sales performance and revenue insights</p>
        </div>
        <div className="flex gap-2 items-center">
          <CurrencySelector variant="compact" showLabel={true} />
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={fixConsistency} variant="outline" size="sm" disabled={loading}>
            <Wrench className="w-4 h-4 mr-2" />
            Fix Consistency
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger>
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="group-by">Group By</Label>
              <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="chart-type">Chart Type</Label>
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">
                    <div className="flex items-center">
                      <LineChart className="w-4 h-4 mr-2" />
                      Line Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Bar Chart
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <AnalyticsDisplay pkrAmount={summary.total_revenue} />
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Revenue</p>
                  <AnalyticsDisplay pkrAmount={summary.net_revenue} />
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subscriptions Sold</p>
                  <p className="text-2xl font-bold text-purple-600">{summary.total_subscriptions}</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
                  <AnalyticsDisplay pkrAmount={summary.average_order_value} />
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Revenue and subscription trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <RechartsLineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'revenue' || name === 'netRevenue' ? `₨${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value,
                      name === 'revenue' ? 'Revenue' : 
                      name === 'netRevenue' ? 'Net Revenue' :
                      name === 'subscriptions' ? 'Subscriptions' : name
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="netRevenue" stroke="#3b82f6" strokeWidth={2} name="Net Revenue" />
                  <Line type="monotone" dataKey="subscriptions" stroke="#8b5cf6" strokeWidth={2} name="Subscriptions" />
                </RechartsLineChart>
              ) : (
                <RechartsBarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'revenue' || name === 'netRevenue' ? `₨${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value,
                      name === 'revenue' ? 'Revenue' : 
                      name === 'netRevenue' ? 'Net Revenue' :
                      name === 'subscriptions' ? 'Subscriptions' : name
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="netRevenue" fill="#3b82f6" name="Net Revenue" />
                  <Bar dataKey="subscriptions" fill="#8b5cf6" name="Subscriptions" />
                </RechartsBarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
            <CardDescription>Revenue by product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={productChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value: any) => [`₨${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10b981" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Distribution</CardTitle>
            <CardDescription>Revenue share by product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={productChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {productChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`₨${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Summary</CardTitle>
          <CardDescription>Detailed breakdown by product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Subscriptions</th>
                  <th className="text-right p-2">Refunds</th>
                  <th className="text-right p-2">Net Revenue</th>
                  <th className="text-right p-2">Active</th>
                  <th className="text-right p-2">Expired</th>
                </tr>
              </thead>
              <tbody>
                {productSummary.map((product) => (
                  <tr key={product.product_id} className="border-b">
                    <td className="p-2 font-medium">{product.product_name}</td>
                    <td className="p-2 text-right"><CurrencyDisplay pkrAmount={product.total_revenue} size="sm" /></td>
                    <td className="p-2 text-right">{product.total_subscriptions}</td>
                    <td className="p-2 text-right text-red-600"><CurrencyDisplay pkrAmount={product.total_refunds} size="sm" /></td>
                    <td className="p-2 text-right font-medium"><CurrencyDisplay pkrAmount={product.net_revenue} size="sm" /></td>
                    <td className="p-2 text-right text-green-600">{product.active_subscriptions}</td>
                    <td className="p-2 text-right text-red-600">{product.expired_subscriptions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
