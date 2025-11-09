import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  ShoppingCart,
  MessageCircle,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  X,
  Trash2,
  AlertTriangle,
  Ban
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';

interface ProductCode {
  id: string;
  code: string;
  user_auth_code_id: string;
  product_id: string;
  subscription_type: string;
  subscription_period: string;
  price: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  admin_notes: string | null;
  approved_at: string | null;
  expires_at: string;
  created_at: string;
  user_auth_code: {
    code: string;
    user_name: string;
    user_email: string;
  };
  product: {
    id: string;
    name: string;
    category: string;
  };
}

interface PurchaseRequest {
  id: string;
  user_name: string;
  user_email: string;
  is_returning_user: boolean;
  total_amount: number;
  currency: string;
  status: string;
  whatsapp_message_sent: boolean;
  created_at: string;
  user_auth_code: {
    code: string;
  };
  product_codes: ProductCode[];
}

export const ProductCodeAdmin = () => {
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [productCodes, setProductCodes] = useState<ProductCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState<ProductCode | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showApproved, setShowApproved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<ProductCode[]>([]);
  const [processingCodeId, setProcessingCodeId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'code' | 'request', id: string, email?: string, name?: string} | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{id: string, code: string, name?: string} | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const { toast } = useToast();

  // Helper function to calculate expiry date based on subscription period
  const calculateExpiryDate = (subscriptionPeriod: string): string => {
    const now = new Date();
    const expiryDate = new Date(now);
    
    switch (subscriptionPeriod) {
      case '1_month':
        expiryDate.setMonth(now.getMonth() + 1);
        break;
      case '3_months':
        expiryDate.setMonth(now.getMonth() + 3);
        break;
      case '6_months':
        expiryDate.setMonth(now.getMonth() + 6);
        break;
      case '1_year':
        expiryDate.setFullYear(now.getFullYear() + 1);
        break;
      case '2_years':
        expiryDate.setFullYear(now.getFullYear() + 2);
        break;
      case 'lifetime':
        // Set to 100 years from now (effectively lifetime)
        expiryDate.setFullYear(now.getFullYear() + 100);
        break;
      default:
        // Default to 1 month
        expiryDate.setMonth(now.getMonth() + 1);
    }
    
    return expiryDate.toISOString();
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch product codes with user and product details
      const { data: codes, error: codesError } = await supabase
        .from('product_codes' as any)
        .select(`
          *,
          user_auth_code:user_auth_codes(code, user_name, user_email),
          product:products(id, name, category)
        `)
        .order('created_at', { ascending: false });

      if (codesError) throw codesError;

      // Group product codes by user for display
      const groupedByUser = (codes as any)?.reduce((acc: any, code: any) => {
        const userEmail = code.user_auth_code?.user_email;
        if (!acc[userEmail]) {
          acc[userEmail] = {
            user_auth_code: code.user_auth_code,
            product_codes: [],
            is_returning_user: false // Default to new user
          };
        }
        acc[userEmail].product_codes.push(code);
        return acc;
      }, {});

      const requests = Object.values(groupedByUser || {});

      setPurchaseRequests(requests as any);
      setProductCodes((codes as any) || []);
      
      // Apply initial filtering
      applySearchFilter(requests as any, (codes as any) || [], searchTerm);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product codes data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applySearchFilter = (requests: any[], codes: ProductCode[], term: string) => {
    if (!term.trim()) {
      setFilteredRequests(requests);
      setFilteredCodes(codes);
      return;
    }

    const lowerTerm = term.toLowerCase();
    
    // Filter requests by user name, email, user code, or any of their product codes
    const filteredReqs = requests.filter((request: any) => {
      const userName = request.user_auth_code?.user_name?.toLowerCase() || '';
      const userEmail = request.user_auth_code?.user_email?.toLowerCase() || '';
      const userCode = request.user_auth_code?.code?.toLowerCase() || '';
      
      // Check if user info matches
      const userMatches = userName.includes(lowerTerm) || 
                         userEmail.includes(lowerTerm) || 
                         userCode.includes(lowerTerm);
      
      // Check if any product code within this user's request matches
      const productMatches = request.product_codes?.some((code: any) => {
        const productName = code.product?.name?.toLowerCase() || '';
        const productCode = code.code?.toLowerCase() || '';
        return productName.includes(lowerTerm) || productCode.includes(lowerTerm);
      }) || false;
      
      return userMatches || productMatches;
    });

    // Filter codes by product name, product code, or user info
    const filteredCodesList = codes.filter((code: ProductCode) => {
      const productName = code.product?.name?.toLowerCase() || '';
      const productCode = code.code?.toLowerCase() || '';
      const userName = code.user_auth_code?.user_name?.toLowerCase() || '';
      const userEmail = code.user_auth_code?.user_email?.toLowerCase() || '';
      const userCode = code.user_auth_code?.code?.toLowerCase() || '';
      
      return productName.includes(lowerTerm) || 
             productCode.includes(lowerTerm) ||
             userName.includes(lowerTerm) ||
             userEmail.includes(lowerTerm) ||
             userCode.includes(lowerTerm);
    });

    setFilteredRequests(filteredReqs);
    setFilteredCodes(filteredCodesList);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    applySearchFilter(purchaseRequests, productCodes, value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredRequests(purchaseRequests);
    setFilteredCodes(productCodes);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (codeId: string) => {
    // Prevent multiple rapid clicks
    if (processingCodeId === codeId) {
      return;
    }
    
    try {
      setProcessingCodeId(codeId);
      console.log('Approving product code:', codeId, 'with notes:', adminNotes);
      
      // Call the database function to approve the product code
      const { data, error } = await supabase.rpc('approve_product_code_admin' as any, {
        p_product_code_id: codeId,
        p_admin_notes: adminNotes || null
      });

      if (error) {
        console.error('Database function error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        toast({
          title: "Error",
          description: `Failed to approve product code: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      // Check the result from the database function
      if (data && (data as any).success) {
        console.log('Approval successful:', data);
        
        // Show success message with additional context if available
        let successMessage = (data as any).message || "Product code approved successfully";
        if ((data as any).subscription_id) {
          successMessage += ` (Subscription ID: ${(data as any).subscription_id})`;
        }
        if ((data as any).product_code) {
          successMessage += ` (Code: ${(data as any).product_code})`;
        }

        toast({
          title: "Success",
          description: successMessage
        });

        // Refresh data to get updated information
        fetchData();
      } else {
        // Handle specific error cases from the database function
        const errorMessage = (data as any)?.error || "Unknown error occurred";
        console.error('Approval failed:', data);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }

      setSelectedCode(null);
      setAdminNotes('');
    } catch (error: any) {
      console.error('Error approving code:', error);
      toast({
        title: "Error",
        description: "Failed to approve product code",
        variant: "destructive"
      });
    } finally {
      setProcessingCodeId(null);
    }
  };

  const handleReject = async (codeId: string) => {
    // Prevent multiple rapid clicks
    if (processingCodeId === codeId) {
      return;
    }
    
    try {
      setProcessingCodeId(codeId);
      console.log('Rejecting product code:', codeId, 'with notes:', adminNotes);
      
      // Call the database function to reject the product code
      const { data, error } = await supabase.rpc('reject_product_code_admin' as any, {
        p_product_code_id: codeId,
        p_admin_notes: adminNotes || null
      });

      if (error) {
        console.error('Database function error:', error);
        toast({
          title: "Error",
          description: `Failed to reject product code: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      // Check the result from the database function
      if (data && (data as any).success) {
        console.log('Rejection successful:', data);
        
        // Show success message with additional context if available
        let successMessage = (data as any).message || "Product code rejected successfully";
        if ((data as any).product_code) {
          successMessage += ` (Code: ${(data as any).product_code})`;
        }

        toast({
          title: "Success",
          description: successMessage
        });

        // Refresh data to get updated information
        fetchData();
      } else {
        // Handle specific error cases from the database function
        const errorMessage = (data as any)?.error || "Unknown error occurred";
        console.error('Rejection failed:', data);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }

      setSelectedCode(null);
      setAdminNotes('');
    } catch (error: any) {
      console.error('Error rejecting code:', error);
      toast({
        title: "Error",
        description: "Failed to reject product code",
        variant: "destructive"
      });
    } finally {
      setProcessingCodeId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard"
    });
  };

  const handleDeleteCode = async (codeId: string) => {
    if (processingCodeId === codeId) {
      return;
    }
    
    try {
      setProcessingCodeId(codeId);
      console.log('Deleting product code:', codeId, 'with notes:', adminNotes);
      
      // Call the database function to delete the product code
      const { data, error } = await supabase.rpc('delete_product_code_admin' as any, {
        p_product_code_id: codeId,
        p_admin_notes: adminNotes || null
      });

      if (error) {
        console.error('Database function error:', error);
        toast({
          title: "Error",
          description: `Failed to delete product code: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      // Check the result from the database function
      if (data && (data as any).success) {
        console.log('Deletion successful:', data);
        
        // Show success message
        let successMessage = (data as any).message || "Product code deleted successfully";
        if ((data as any).product_code) {
          successMessage += ` (Code: ${(data as any).product_code})`;
        }

        toast({
          title: "Success",
          description: successMessage
        });

        // Refresh data to get updated information
        fetchData();
      } else {
        // Handle specific error cases from the database function
        const errorMessage = (data as any)?.error || "Unknown error occurred";
        console.error('Deletion failed:', data);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }

      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      setAdminNotes('');
    } catch (error: any) {
      console.error('Error deleting code:', error);
      toast({
        title: "Error",
        description: "Failed to delete product code",
        variant: "destructive"
      });
    } finally {
      setProcessingCodeId(null);
    }
  };

  const handleDeleteRequest = async (userEmail: string) => {
    if (processingCodeId === userEmail) {
      return;
    }
    
    try {
      setProcessingCodeId(userEmail);
      console.log('Deleting purchase request for user:', userEmail, 'with notes:', adminNotes);
      
      // Call the database function to delete the purchase request
      const { data, error } = await supabase.rpc('delete_user_product_codes_admin' as any, {
        p_user_email: userEmail,
        p_admin_notes: adminNotes || null
      });

      if (error) {
        console.error('Database function error:', error);
        toast({
          title: "Error",
          description: `Failed to delete purchase request: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      // Check the result from the database function
      if (data && (data as any).success) {
        console.log('Deletion successful:', data);
        
        // Show success message with detailed information
        let successMessage = (data as any).message || "Purchase request processed successfully";
        
        // Add detailed counts
        const response = data as any;
        if (response.deleted_codes_count > 0) {
          successMessage += ` (${response.deleted_codes_count} codes deleted)`;
        }
        
        if (response.approved_codes_count > 0) {
          successMessage += ` (${response.approved_codes_count} approved codes preserved)`;
        }
        
        if (response.note) {
          successMessage += ` - ${response.note}`;
        }

        toast({
          title: "Success",
          description: successMessage
        });

        // Refresh data to get updated information
        fetchData();
      } else {
        // Handle specific error cases from the database function
        const errorMessage = (data as any)?.error || "Unknown error occurred";
        console.error('Deletion failed:', data);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }

      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      setAdminNotes('');
    } catch (error: any) {
      console.error('Error deleting request:', error);
      toast({
        title: "Error",
        description: "Failed to delete purchase request",
        variant: "destructive"
      });
    } finally {
      setProcessingCodeId(null);
    }
  };

  const openDeleteConfirm = (type: 'code' | 'request', id: string, email?: string, name?: string) => {
    setDeleteTarget({ type, id, email, name });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === 'code') {
      handleDeleteCode(deleteTarget.id);
    } else if (deleteTarget.type === 'request' && deleteTarget.email) {
      handleDeleteRequest(deleteTarget.email);
    }
  };

  const handleCancelSubscription = async (productCodeId: string, adminNotes: string) => {
    try {
      setProcessingCodeId(productCodeId);
      
      const { data, error } = await (supabase.rpc as any)('cancel_approved_subscription_admin', {
        p_product_code_id: productCodeId,
        p_admin_notes: adminNotes
      });

      if (error) {
        console.error('Cancellation failed:', error);
        toast({
          title: "Cancellation Failed",
          description: `Failed to cancel subscription: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (data && data.success) {
        toast({
          title: "Subscription Cancelled",
          description: `Successfully cancelled subscription for code ${data.product_code}. The user's dashboard will be updated automatically.`,
        });
        await fetchData(); // Refresh data
      } else {
        toast({
          title: "Cancellation Failed",
          description: data?.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      toast({
        title: "Cancellation Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessingCodeId(null);
    }
  };

  const openCancelConfirm = (id: string, code: string, name?: string) => {
    setCancelTarget({ id, code, name });
    setCancelConfirmOpen(true);
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    
    const adminNotes = `Subscription cancelled by admin`;
    handleCancelSubscription(cancelTarget.id, adminNotes);
    
    setCancelConfirmOpen(false);
    setCancelTarget(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'expired':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300"><Ban className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCodes = filteredCodes.filter(code => code.status === 'pending');
  const approvedCodes = filteredCodes.filter(code => code.status === 'approved');
  const rejectedCodes = filteredCodes.filter(code => code.status === 'rejected');
  const cancelledCodes = filteredCodes.filter(code => code.status === 'cancelled');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading product codes...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Code Management</h2>
          <p className="text-muted-foreground">Manage pending product code requests and approvals</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by user name, email, user code, product name, or product code..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {searchTerm && (
              <div className="text-sm text-muted-foreground">
                {filteredRequests.length} user{filteredRequests.length !== 1 ? 's' : ''} found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{pendingCodes.length}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedCodes.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCodes.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold text-orange-600">{cancelledCodes.length}</p>
              </div>
              <Ban className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{purchaseRequests.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toggle */}
      <div className="flex gap-2">
        <Button
          variant={!showApproved ? "default" : "outline"}
          onClick={() => setShowApproved(false)}
        >
          Pending Requests
        </Button>
        <Button
          variant={showApproved ? "default" : "outline"}
          onClick={() => setShowApproved(true)}
        >
          All Codes
        </Button>
      </div>

      {/* Purchase Requests */}
      {!showApproved && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Purchase Requests</h3>
          {purchaseRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No purchase requests found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request, index) => (
              <Card key={`request-${request.user_auth_code?.user_email || 'unknown'}-${index}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {request.user_auth_code?.user_name || 'Unknown User'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {request.user_auth_code?.user_email || 'No email'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-2">
                        <Badge variant={request.is_returning_user ? "secondary" : "default"}>
                          {request.is_returning_user ? "Returning" : "New"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteConfirm('request', request.user_auth_code?.user_email || '', request.user_auth_code?.user_email, request.user_auth_code?.user_name)}
                          className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <CurrencyDisplay pkrAmount={request.product_codes?.reduce((sum: number, code: any) => sum + (code.price || 0), 0) || 0} size="sm" />
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">User Code:</span>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {request.user_auth_code.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(request.user_auth_code.code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Product Codes:</p>
                      <div className="space-y-2">
                        {request.product_codes.map((code, codeIndex) => (
                          <div key={`${request.user_auth_code?.user_email || 'unknown'}-${code.id}-${codeIndex}`} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-sm">{code.code}</code>
                              <span className="text-sm text-muted-foreground">
                                {code.product.name}
                              </span>
                              {getStatusBadge(code.status)}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCode(code)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* All Product Codes */}
      {showApproved && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">All Product Codes</h3>
          {productCodes.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No product codes found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCodes.map((code, index) => (
                <Card key={`code-${code.id}-${index}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{code.product.name}</CardTitle>
                      {getStatusBadge(code.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono flex-1">
                        {code.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(code.code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>User:</strong> {code.user_auth_code.user_name}</p>
                      <p><strong>Email:</strong> {code.user_auth_code.user_email}</p>
                      <p><strong>Plan:</strong> {code.subscription_type} - {code.subscription_period}</p>
                      <p><strong>Price:</strong> <CurrencyDisplay pkrAmount={code.price || 0} size="sm" /></p>
                    </div>
                    <div className="flex gap-2">
                      {code.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCode(code)}
                          className="flex-1"
                        >
                          Review
                        </Button>
                      )}
                      {code.status === 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCancelConfirm(code.id, code.code, code.user_auth_code.user_name)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          disabled={processingCodeId === code.id}
                        >
                          {processingCodeId === code.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Ban className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                      {code.status !== 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteConfirm('code', code.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approval Modal */}
      {selectedCode && (
        <Card className="fixed inset-4 z-50 bg-background border-2">
          <CardHeader>
            <CardTitle>Review Product Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Code</Label>
                <code className="block bg-muted px-3 py-2 rounded font-mono">
                  {selectedCode.code}
                </code>
              </div>
              <div>
                <Label>Product</Label>
                <p className="font-medium">{selectedCode.product.name}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>User</Label>
                <p>{selectedCode.user_auth_code.user_name}</p>
                <p className="text-sm text-muted-foreground">{selectedCode.user_auth_code.user_email}</p>
              </div>
              <div>
                <Label>Plan & Price</Label>
                <p>{selectedCode.subscription_type} - {selectedCode.subscription_period}</p>
                <p><CurrencyDisplay pkrAmount={selectedCode.price || 0} size="sm" /></p>
              </div>
            </div>

            <div>
              <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
              <Textarea
                id="admin-notes"
                placeholder="Add any notes about this approval/rejection..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCode(null);
                  setAdminNotes('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(selectedCode.id)}
                className="flex-1"
                disabled={processingCodeId === selectedCode.id}
              >
                {processingCodeId === selectedCode.id ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                {processingCodeId === selectedCode.id ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button
                onClick={() => handleApprove(selectedCode.id)}
                className="flex-1"
                disabled={processingCodeId === selectedCode.id}
              >
                {processingCodeId === selectedCode.id ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {processingCodeId === selectedCode.id ? 'Approving...' : 'Approve'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && deleteTarget && (
        <Card className="fixed inset-4 z-50 bg-background border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Deletion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="font-medium">
                {deleteTarget.type === 'code' ? 'Delete Product Code' : 'Delete Purchase Request'}
              </p>
              {deleteTarget.type === 'code' ? (
                <p className="text-sm text-muted-foreground">
                  This will permanently delete the product code. This action cannot be undone.
                </p>
              ) : (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>This will delete pending and rejected product codes for:</p>
                  <p><strong>User:</strong> {deleteTarget.name}</p>
                  <p><strong>Email:</strong> {deleteTarget.email}</p>
                  <div className="bg-blue-50 p-2 rounded border border-blue-200">
                    <p className="text-blue-800 font-medium">ℹ️ Approved codes will be preserved</p>
                    <p className="text-blue-700 text-xs">Only pending and rejected codes will be deleted</p>
                  </div>
                  <p className="text-red-600 font-medium">This action cannot be undone.</p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="delete-notes">Admin Notes (Optional)</Label>
              <Textarea
                id="delete-notes"
                placeholder="Add any notes about this deletion..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setDeleteTarget(null);
                  setAdminNotes('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="flex-1"
                disabled={processingCodeId !== null}
              >
                {processingCodeId ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                {processingCodeId ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelConfirmOpen && cancelTarget && (
        <Card className="fixed inset-4 z-50 bg-background border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Ban className="w-5 h-5" />
              Cancel Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="font-medium">Cancel Approved Subscription</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>This will cancel the subscription for:</p>
                <p><strong>User:</strong> {cancelTarget.name}</p>
                <p><strong>Product Code:</strong> {cancelTarget.code}</p>
                <div className="bg-orange-50 p-2 rounded border border-orange-200">
                  <p className="text-orange-800 font-medium">⚠️ This will cancel the user's active subscription</p>
                  <p className="text-orange-700 text-xs">The product code will be marked as cancelled and the user will lose access</p>
                </div>
                <p className="text-red-600 font-medium">This action cannot be undone.</p>
              </div>
            </div>

            <div>
              <Label htmlFor="cancel-notes">Admin Notes (Optional)</Label>
              <Textarea
                id="cancel-notes"
                placeholder="Add any notes about this cancellation..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setCancelConfirmOpen(false);
                  setCancelTarget(null);
                  setAdminNotes('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancel}
                className="flex-1"
                disabled={processingCodeId !== null}
              >
                {processingCodeId ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Ban className="w-4 h-4 mr-2" />
                )}
                {processingCodeId ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
