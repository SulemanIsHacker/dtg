import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const RefundAdjustments = () => {
  const { data: adjustments } = useQuery({
    queryKey: ['financial-adjustments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_adjustments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: refunds } = useQuery({
    queryKey: ['subscription-refunds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_refund_requests')
        .select('*, subscription:user_subscriptions(product:products(name))')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  const totalRefunds = adjustments?.reduce((sum, adj) => {
    return adj.adjustment_type === 'refund' ? sum + (Number(adj.amount) || 0) : sum;
  }, 0) || 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-red-500" />
            Total Refunds Issued
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-500">PKR {totalRefunds.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {adjustments?.filter(a => a.adjustment_type === 'refund').length || 0} refund transactions
          </p>
        </CardContent>
      </Card>

      {/* Subscription Refund Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Refund Requests</CardTitle>
          <CardDescription>Track refunds from the subscription system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {refunds?.map((refund: any) => (
              <div key={refund.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{refund.reason}</h4>
                    <Badge variant={
                      refund.status === 'approved' ? 'default' :
                      refund.status === 'pending' ? 'outline' :
                      'destructive'
                    }>
                      {refund.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div><span className="font-medium">Product:</span> {refund.subscription?.product?.name || 'N/A'}</div>
                    <div><span className="font-medium">Amount:</span> PKR {refund.refund_amount || 0}</div>
                    <div><span className="font-medium">Date:</span> {format(new Date(refund.created_at), 'MMM dd, yyyy')}</div>
                  </div>
                  {refund.description && (
                    <p className="text-sm text-muted-foreground mt-2">{refund.description}</p>
                  )}
                </div>
              </div>
            ))}
            {(!refunds || refunds.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No refund requests found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Adjustments */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Adjustments</CardTitle>
          <CardDescription>Manual adjustments and corrections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adjustments?.map((adjustment: any) => (
              <div key={adjustment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold capitalize">{adjustment.adjustment_type}</h4>
                    <Badge variant="outline">{adjustment.currency} {adjustment.amount}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{adjustment.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(adjustment.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            {(!adjustments || adjustments.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No financial adjustments found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundAdjustments;
