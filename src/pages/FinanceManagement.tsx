import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, RotateCcw, Wallet, Building2, BarChart3, Loader2 } from "lucide-react";
import IncomingPayments from "@/components/finance/IncomingPayments";
import VendorPayments from "@/components/finance/VendorPayments";
import RefundAdjustments from "@/components/finance/RefundAdjustments";
import FinanceAnalytics from "@/components/finance/FinanceAnalytics";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { AdminLogin } from "@/components/AdminLogin";

const FinanceManagement = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const { data: summary, isLoading } = useQuery({
    queryKey: ['financial-summary', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_financial_summary', {
        p_start_date: dateRange.start,
        p_end_date: dateRange.end
      });
      if (error) throw error;
      return data[0];
    },
    enabled: !!isAdmin
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLogin />;
  }

  const stats = [
    {
      title: "Total Income",
      value: `NGN ${summary?.total_income?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Total Expenses",
      value: `NGN ${summary?.total_expenses?.toLocaleString() || '0'}`,
      icon: TrendingDown,
      color: "from-orange-500 to-amber-600"
    },
    {
      title: "Total Refunds",
      value: `NGN ${summary?.total_refunds?.toLocaleString() || '0'}`,
      icon: RotateCcw,
      color: "from-red-500 to-rose-600"
    },
    {
      title: "Net Profit",
      value: `NGN ${summary?.net_profit?.toLocaleString() || '0'}`,
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-600"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent">
            Finance Management
          </h1>
          <p className="text-muted-foreground">
            Track all money flow - incoming payments, vendor expenses, and profitability
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-brand-teal/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-yellow-500" />
                Pending Payments to Verify
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{summary.pending_payments || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Customer payments awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                Pending Vendor Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{summary.pending_vendor_payments || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Payments due to vendors</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="incoming">Incoming Payments</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Payments</TabsTrigger>
          <TabsTrigger value="refunds">Refunds & Adjustments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-6">
          <IncomingPayments />
        </TabsContent>

        <TabsContent value="vendors" className="mt-6">
          <VendorPayments />
        </TabsContent>

        <TabsContent value="refunds" className="mt-6">
          <RefundAdjustments />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <FinanceAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceManagement;
