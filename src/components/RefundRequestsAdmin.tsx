import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  Mail, 
  Calendar,
  User,
  FileText,
  AlertTriangle,
  DollarSign,
  RefreshCw,
  MessageSquare,
  ShoppingCart,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GeneralRefundRequest {
  id: string;
  ticket_id: string;
  name: string;
  email: string;
  order_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  proof_files: Array<{
    filename: string;
    size: number;
    mimetype: string;
  }>;
  admin_notes?: string;
  refund_amount?: number;
  refund_method?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

interface SubscriptionRefundRequest {
  id: string;
  subscription_id: string;
  user_auth_code_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  refund_amount?: number;
  refund_method?: string;
  processed_at?: string;
  created_at: string;
  subscription?: {
    id: string;
    user_auth_code_id: string;
    product_id: string;
    status: string;
    user_auth_code?: {
      code: string;
      user_name: string;
      user_email: string;
    };
    product?: {
      id: string;
      name: string;
      category: string;
    };
  };
}

export const RefundRequestsAdmin = () => {
  const [generalRequests, setGeneralRequests] = useState<GeneralRefundRequest[]>([]);
  const [subscriptionRequests, setSubscriptionRequests] = useState<SubscriptionRefundRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<GeneralRefundRequest | SubscriptionRefundRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('');
  const [requestType, setRequestType] = useState<'general' | 'subscription'>('general');
  const { toast } = useToast();

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const fetchRefundRequests = async () => {
    try {
      setLoading(true);
      await fetchSubscriptionRefundRequests();
    } catch (error) {
      console.error('Error fetching refund requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch refund requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionRefundRequests = async () => {
    const { data, error } = await supabase
      .from('subscription_refund_requests')
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
      console.error('Error fetching subscription refund requests:', error);
      return;
    }

    setSubscriptionRequests((data as SubscriptionRefundRequest[]) || []);
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const updateData: any = {
        status,
        admin_notes: adminNotes,
        refund_amount: refundAmount ? parseFloat(refundAmount) : null,
        refund_method: refundMethod,
        processed_at: status === 'completed' ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('subscription_refund_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Refund request updated successfully"
      });

      // Refresh data
      await fetchRefundRequests();
      setSelectedRequest(null);
      setAdminNotes('');
      setRefundAmount('');
      setRefundMethod('');
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update refund request",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'under_review':
        return <Eye className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleRequestClick = (request: GeneralRefundRequest | SubscriptionRefundRequest, type: 'general' | 'subscription') => {
    setSelectedRequest(request);
    setRequestType(type);
    setAdminNotes(request.admin_notes || '');
    setRefundAmount(request.refund_amount?.toString() || '');
    setRefundMethod(request.refund_method || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Refund Requests Management</h1>
        <p className="text-muted-foreground">Review and manage all customer refund requests</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="overflow-x-auto scrollbar-hide">
          <TabsList className="inline-flex w-max min-w-full h-auto p-1 bg-muted rounded-md">
            <TabsTrigger value="general" className="flex items-center justify-center space-x-2 text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
              <span>General Requests ({generalRequests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center justify-center space-x-2 text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0">
              <ShoppingCart className="w-4 h-4" />
              <span>Subscription Requests ({subscriptionRequests.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* General Refund Requests Tab */}
        <TabsContent value="general" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">General Refund Requests</h2>
            <Button variant="outline" onClick={fetchRefundRequests}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {generalRequests.map((request) => (
              <Card 
                key={request.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleRequestClick(request, 'general')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{request.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {request.email}
                          </span>
                          <span className="flex items-center">
                            <CreditCard className="w-3 h-3 mr-1" />
                            {request.order_id}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.reason.replace('-', ' ')} - {request.description.substring(0, 100)}...
                        </p>
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

        {/* Subscription Refund Requests Tab */}
        <TabsContent value="subscription" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Subscription Refund Requests</h2>
            <Button variant="outline" onClick={fetchRefundRequests}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {subscriptionRequests.map((request) => (
              <Card 
                key={request.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleRequestClick(request, 'subscription')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{request.subscription?.product?.name || 'Unknown Product'}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {request.subscription?.user_auth_code?.user_name || 'Unknown User'}
                          </span>
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {request.subscription?.user_auth_code?.user_email || 'Unknown Email'}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.reason.replace('-', ' ')} - {request.description.substring(0, 100)}...
                        </p>
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

      {/* Request Details Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Refund Request Details</span>
            </DialogTitle>
            <DialogDescription>
              Review and manage this refund request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Request Type</Label>
                  <p className="text-lg font-semibold">
                    {requestType === 'general' ? 'General Refund Request' : 'Subscription Refund Request'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1 capitalize">{selectedRequest.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requestType === 'general' ? (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Customer Name</Label>
                      <p className="text-lg">{(selectedRequest as GeneralRefundRequest).name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="text-lg">{(selectedRequest as GeneralRefundRequest).email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Order ID</Label>
                      <p className="text-lg font-mono">{(selectedRequest as GeneralRefundRequest).order_id}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Customer Name</Label>
                      <p className="text-lg">{(selectedRequest as SubscriptionRefundRequest).subscription?.user_auth_code?.user_name || 'Unknown'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="text-lg">{(selectedRequest as SubscriptionRefundRequest).subscription?.user_auth_code?.user_email || 'Unknown'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Product</Label>
                      <p className="text-lg">{(selectedRequest as SubscriptionRefundRequest).subscription?.product?.name || 'Unknown Product'}</p>
                    </div>
                  </>
                )}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="text-lg">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Request Details */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Reason</Label>
                <p className="text-lg capitalize">{selectedRequest.reason.replace('-', ' ')}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-lg whitespace-pre-wrap">{selectedRequest.description}</p>
              </div>

              {/* Proof Files (for general requests) */}
              {requestType === 'general' && (selectedRequest as GeneralRefundRequest).proof_files?.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Proof Files</Label>
                  <div className="space-y-2">
                    {(selectedRequest as GeneralRefundRequest).proof_files.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{file.filename}</span>
                        <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Admin Actions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admin-notes">Admin Notes</Label>
                    <Textarea
                      id="admin-notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this request..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="refund-amount">Refund Amount</Label>
                      <Input
                        id="refund-amount"
                        type="number"
                        step="0.01"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="refund-method">Refund Method</Label>
                      <Select value={refundMethod} onValueChange={setRefundMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="original_payment">Original Payment Method</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="store_credit">Store Credit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => updateRequestStatus(selectedRequest.id, 'under_review')}
                    variant="outline"
                    disabled={selectedRequest.status === 'under_review'}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Mark Under Review
                  </Button>
                  <Button
                    onClick={() => updateRequestStatus(selectedRequest.id, 'approved')}
                    variant="outline"
                    disabled={selectedRequest.status === 'approved'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                    variant="destructive"
                    disabled={selectedRequest.status === 'rejected'}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => updateRequestStatus(selectedRequest.id, 'completed')}
                    disabled={selectedRequest.status === 'completed'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Completed
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

