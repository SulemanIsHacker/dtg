import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, CheckCircle, XCircle, Clock, Filter } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

const IncomingPayments = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['incoming-payments', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('incoming_payments')
        .select('*, product:products(name), subscription:user_subscriptions(subscription_type)')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('payment_status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const confirmPayment = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from('incoming_payments')
        .update({ payment_status: 'confirmed', verified_by: (await supabase.auth.getUser()).data.user?.id })
        .eq('id', paymentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incoming-payments'] });
      toast.success('Payment confirmed successfully');
    }
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { variant: "outline" as const, className: "border-yellow-500 text-yellow-500", icon: Clock },
      confirmed: { variant: "outline" as const, className: "border-green-500 text-green-500", icon: CheckCircle },
      failed: { variant: "outline" as const, className: "border-red-500 text-red-500", icon: XCircle },
      refunded: { variant: "outline" as const, className: "border-gray-500 text-gray-500", icon: XCircle }
    };
    
    const config = badges[status as keyof typeof badges] || badges.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Incoming Payments</span>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manual Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Manual Payment</DialogTitle>
                </DialogHeader>
                <AddPaymentForm onSuccess={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>Track all customer payments and subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">Loading...</CardContent>
          </Card>
        ) : payments?.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No payments found
            </CardContent>
          </Card>
        ) : (
          payments?.map((payment: any) => (
            <Card key={payment.id} className="hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{payment.customer_name}</h3>
                      {getStatusBadge(payment.payment_status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Email:</span> {payment.customer_email}
                      </div>
                      <div>
                        <span className="font-medium">Product:</span> {payment.product?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span> {payment.currency} {payment.amount}
                      </div>
                      <div>
                        <span className="font-medium">Method:</span> {payment.payment_method || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                      </div>
                      {payment.transaction_id && (
                        <div>
                          <span className="font-medium">TX ID:</span> {payment.transaction_id}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {payment.payment_status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => confirmPayment.mutate(payment.id)}
                        disabled={confirmPayment.isPending || !isAdmin}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm
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

const AddPaymentForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    product_id: '',
    amount: '',
    currency: 'NGN',
    payment_method: '',
    transaction_id: '',
    admin_notes: ''
  });

  const { data: products } = useQuery({
    queryKey: ['products-for-payment'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data;
    }
  });

  const addPayment = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('incoming_payments').insert([{
        ...data,
        payment_status: 'confirmed'
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incoming-payments'] });
      toast.success('Payment added successfully');
      onSuccess();
    },
    onError: (error: any) => {
      const errorMsg = String(error?.message || '');
      if (errorMsg.toLowerCase().includes('row-level security') || errorMsg.toLowerCase().includes('rls')) {
        toast.error('Permission denied by security policy. Please sign in as admin.');
      } else {
        toast.error(error.message || 'Failed to add payment');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Please sign in as admin to add payments.');
      return;
    }
    
    addPayment.mutate({
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      product_id: formData.product_id,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      payment_method: formData.payment_method,
      transaction_id: formData.transaction_id || null,
      admin_notes: formData.admin_notes || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_name">Customer Name *</Label>
          <Input 
            id="customer_name" 
            value={formData.customer_name}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
            required 
          />
        </div>
        <div>
          <Label htmlFor="customer_email">Customer Email *</Label>
          <Input 
            id="customer_email" 
            type="email"
            value={formData.customer_email}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
            required 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="product_id">Product *</Label>
          <Select 
            value={formData.product_id} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products?.map((product: any) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input 
            id="amount" 
            type="number" 
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            required 
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="currency">Currency *</Label>
          <Select 
            value={formData.currency}
            onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NGN">NGN</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="payment_method">Payment Method *</Label>
          <Select 
            value={formData.payment_method}
            onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easypaisa">EasyPaisa</SelectItem>
              <SelectItem value="jazzcash">JazzCash</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="transaction_id">Transaction ID</Label>
          <Input 
            id="transaction_id"
            value={formData.transaction_id}
            onChange={(e) => setFormData(prev => ({ ...prev, transaction_id: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="admin_notes">Notes</Label>
        <Textarea 
          id="admin_notes"
          rows={3}
          value={formData.admin_notes}
          onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
        />
      </div>

      <Button type="submit" className="w-full" disabled={addPayment.isPending}>
        Add Payment
      </Button>
    </form>
  );
};

export default IncomingPayments;
