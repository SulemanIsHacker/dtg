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
import { Building2, Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

const VendorPayments = () => {
  const { isAdmin } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: vendors } = useQuery({
    queryKey: ['vendor-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .order('vendor_name');
      if (error) throw error;
      return data;
    }
  });

  const { data: transactions } = useQuery({
    queryKey: ['vendor-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_transactions')
        .select('*, product:products(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const markAsPaid = useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from('vendor_transactions')
        .update({ payment_status: 'paid', payment_date: new Date().toISOString() })
        .eq('id', transactionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profiles'] });
      toast.success('Payment marked as paid');
    }
  });

  const totalDue = vendors?.reduce((sum, v) => sum + (Number(v.total_due) || 0), 0) || 0;
  const totalPaid = vendors?.reduce((sum, v) => sum + (Number(v.total_paid) || 0), 0) || 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-lg">Total Due</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">NGN {totalDue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20">
          <CardHeader>
            <CardTitle className="text-lg">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">NGN {totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-lg">Active Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">{vendors?.filter(v => v.is_active).length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendor List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Vendor Profiles</span>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vendor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Vendor</DialogTitle>
                </DialogHeader>
                <AddVendorForm onSuccess={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {vendors?.map((vendor: any) => (
              <Card key={vendor.id} className="border-brand-teal/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{vendor.vendor_name}</h3>
                        <p className="text-sm text-muted-foreground">{vendor.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Due</p>
                      <p className="text-xl font-bold text-orange-500">NGN {vendor.total_due?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Transactions</CardTitle>
          <CardDescription>Track all payments to vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions?.map((transaction: any) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{transaction.vendor_name}</h4>
                    <Badge variant={transaction.payment_status === 'paid' ? 'default' : 'outline'}>
                      {transaction.payment_status === 'paid' ? (
                        <><CheckCircle className="w-3 h-3 mr-1" />Paid</>
                      ) : (
                        <><Clock className="w-3 h-3 mr-1" />Pending</>
                      )}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm text-muted-foreground">
                    <div><span className="font-medium">Product:</span> {transaction.product?.name || 'N/A'}</div>
                    <div><span className="font-medium">Amount:</span> NGN {transaction.amount}</div>
                    <div><span className="font-medium">Type:</span> {transaction.transaction_type}</div>
                    <div><span className="font-medium">Date:</span> {format(new Date(transaction.created_at), 'MMM dd, yyyy')}</div>
                  </div>
                </div>
                {transaction.payment_status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => markAsPaid.mutate(transaction.id)}
                    disabled={markAsPaid.isPending || !isAdmin}
                  >
                    Mark as Paid
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AddVendorForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    vendor_name: '',
    contact_person: '',
    email: '',
    phone: '',
    payment_method: '',
    notes: ''
  });

  const addVendor = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('vendor_profiles').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-profiles'] });
      toast.success('Vendor added successfully');
      onSuccess();
    },
    onError: (error: any) => {
      const errorMsg = String(error?.message || '');
      if (errorMsg.toLowerCase().includes('row-level security') || errorMsg.toLowerCase().includes('rls')) {
        toast.error('Permission denied by security policy. Please sign in as admin.');
      } else {
        toast.error(error.message || 'Failed to add vendor');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Please sign in as admin to add vendors.');
      return;
    }
    
    addVendor.mutate({
      vendor_name: formData.vendor_name,
      contact_person: formData.contact_person || null,
      email: formData.email || null,
      phone: formData.phone || null,
      payment_method: formData.payment_method || null,
      notes: formData.notes || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="vendor_name">Vendor Name *</Label>
        <Input 
          id="vendor_name"
          value={formData.vendor_name}
          onChange={(e) => setFormData(prev => ({ ...prev, vendor_name: e.target.value }))}
          required 
        />
      </div>
      <div>
        <Label htmlFor="contact_person">Contact Person</Label>
        <Input 
          id="contact_person"
          value={formData.contact_person}
          onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="payment_method">Preferred Payment Method</Label>
        <Input 
          id="payment_method"
          value={formData.payment_method}
          onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes" 
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        />
      </div>
      <Button type="submit" className="w-full" disabled={addVendor.isPending}>
        Add Vendor
      </Button>
    </form>
  );
};

export default VendorPayments;
