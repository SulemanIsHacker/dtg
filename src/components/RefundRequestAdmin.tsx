import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
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
  DollarSign
} from 'lucide-react';

interface RefundRequest {
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
  created_at: string;
  updated_at: string;
}

const RefundRequestAdmin = () => {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('');

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const fetchRefundRequests = async () => {
    try {
      // In a real app, this would fetch from your API
      const response = await fetch('/api/admin/refund-requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching refund requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (ticketId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/refund-requests/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          admin_notes: adminNotes,
          refund_amount: refundAmount ? parseFloat(refundAmount) : null,
          refund_method: refundMethod
        }),
      });

      if (response.ok) {
        fetchRefundRequests();
        setSelectedRequest(null);
        setAdminNotes('');
        setRefundAmount('');
        setRefundMethod('');
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" variant="dots" text="Loading refund requests..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Refund Requests Management</h1>
        <p className="text-muted-foreground">Review and manage customer refund requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Refund Requests</CardTitle>
              <CardDescription>
                {requests.length} total requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                        </Badge>
                        <span className="font-mono text-sm text-muted-foreground">
                          {request.ticket_id}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Customer:</span>
                        <p className="font-medium">{request.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Order ID:</span>
                        <p className="font-mono">{request.order_id}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <span className="text-muted-foreground text-sm">Reason:</span>
                      <p className="text-sm capitalize">{request.reason.replace('-', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Details */}
        <div className="lg:col-span-1">
          {selectedRequest ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Request Details
                </CardTitle>
                <CardDescription>
                  Ticket ID: {selectedRequest.ticket_id}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedRequest.name}</p>
                    <p><strong>Email:</strong> {selectedRequest.email}</p>
                    <p><strong>Order ID:</strong> {selectedRequest.order_id}</p>
                  </div>
                </div>

                {/* Request Details */}
                <div>
                  <h4 className="font-semibold mb-2">Request Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Reason:</strong> {selectedRequest.reason.replace('-', ' ')}</p>
                    <p><strong>Description:</strong></p>
                    <p className="text-muted-foreground bg-muted p-2 rounded text-xs">
                      {selectedRequest.description}
                    </p>
                  </div>
                </div>

                {/* Proof Files */}
                {selectedRequest.proof_files.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Proof Files</h4>
                    <div className="space-y-2">
                      {selectedRequest.proof_files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                          <span>{file.filename}</span>
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
                {selectedRequest.status === 'pending' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Admin Notes</label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this request..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium">Refund Amount</label>
                        <Input
                          type="number"
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Refund Method</label>
                        <select
                          value={refundMethod}
                          onChange={(e) => setRefundMethod(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">Select method</option>
                          <option value="original_payment">Original Payment Method</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="store_credit">Store Credit</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateRequestStatus(selectedRequest.ticket_id, 'approved')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => updateRequestStatus(selectedRequest.ticket_id, 'rejected')}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {/* Status Actions */}
                {selectedRequest.status === 'approved' && (
                  <Button
                    onClick={() => updateRequestStatus(selectedRequest.ticket_id, 'completed')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Mark as Completed
                  </Button>
                )}

                {/* Contact Customer */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`mailto:${selectedRequest.email}?subject=Refund Request ${selectedRequest.ticket_id}`)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Customer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Select a request to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefundRequestAdmin;
