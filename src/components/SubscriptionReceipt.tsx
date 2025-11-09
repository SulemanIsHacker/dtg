import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CurrencyDisplay } from './CurrencyDisplay';

interface Product {
  id: string;
  name: string;
  category: string;
  subscription_type: string;
  subscription_period: string;
  price: number;
  custom_price?: number | null;
}

interface SubscriptionReceiptProps {
  subscription: {
    id: string;
    start_date: string;
    expiry_date: string;
    auto_renew: boolean;
    notes?: string | null;
    custom_price?: number | null;
    currency?: string;
    subscription_type?: string;
    subscription_period?: string;
    user_auth_code?: {
      user_name: string;
      user_email: string;
      code: string;
    };
    product?: {
      id: string;
      name: string;
      category: string;
    };
    products?: Product[];
  };
  onClose?: () => void;
}

export const SubscriptionReceipt = ({ subscription, onClose }: SubscriptionReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP-${random}`;
  };

  const calculateTotalPrice = () => {
    // If we have products array, use that
    if (subscription.products && subscription.products.length > 0) {
      return subscription.products.reduce((total, product) => {
        const price = product.custom_price || product.price;
        return total + price;
      }, 0);
    }

    // If we have a single product, calculate its price
    if (subscription.product && subscription.subscription_type && subscription.subscription_period) {
      if (subscription.custom_price) {
        return subscription.custom_price;
      }
      return calculateProductPrice({
        id: subscription.product.id,
        name: subscription.product.name,
        category: subscription.product.category,
        subscription_type: subscription.subscription_type,
        subscription_period: subscription.subscription_period,
        price: 0
      });
    }

    return 0;
  };

  const calculateProductPrice = (product: Product) => {
    if (product.custom_price) {
      return product.custom_price;
    }

    // Base prices for different subscription types
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

    const basePrice = basePrices[product.subscription_type as keyof typeof basePrices] || 5;
    const multiplier = periodMultipliers[product.subscription_period as keyof typeof periodMultipliers] || 1;
    
    return basePrice * multiplier;
  };

  const downloadReceiptAsPDF = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: receiptRef.current.scrollWidth,
        height: receiptRef.current.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`toolsy-receipt-${receiptNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const downloadReceiptAsPNG = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: receiptRef.current.scrollWidth,
        height: receiptRef.current.scrollHeight
      });

      // Create download link for PNG
      const link = document.createElement('a');
      link.download = `toolsy-receipt-${receiptNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PNG:', error);
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPeriod = (period: string) => {
    return period.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const receiptNumber = generateReceiptNumber();
  const totalPrice = calculateTotalPrice();
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Determine if subscription is active, expired, or expiring soon
  const expiryDate = new Date(subscription.expiry_date);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  let status = 'PAID';
  let statusColor = 'bg-primary text-primary-foreground';
  
  if (daysUntilExpiry < 0) {
    status = 'EXPIRED';
    statusColor = 'bg-brand-red text-white';
  } else if (daysUntilExpiry <= 7) {
    status = 'EXPIRING SOON';
    statusColor = 'bg-brand-orange text-white';
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Subscription Receipt</h2>
            <div className="flex gap-2">
              <Button 
                onClick={downloadReceiptAsPDF} 
                className="bg-brand-blue hover:bg-brand-blue/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                onClick={downloadReceiptAsPNG} 
                className="bg-brand-purple hover:bg-brand-purple/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
              {onClose && (
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="border-gray-400 text-gray-800 hover:bg-gray-100 hover:border-gray-500 transition-all duration-300 font-medium"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              )}
            </div>
          </div>

          {/* Receipt Content */}
          <div ref={receiptRef} className="bg-white p-0 rounded-xl overflow-hidden shadow-lg">
            {/* Header Section - Golden Background */}
            <div className="bg-primary px-8 py-12 text-center relative">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center">
                  <img 
                    src="/dtg.jpeg" 
                    alt="DAILYTECH TOOLS SOLUTIONS Logo" 
                    className="w-12 h-12 object-contain"
                  />
                </div>
              </div>
              
              {/* Company Name */}
              <h1 className="text-4xl font-bold text-black mb-2">DAILYTECH TOOLS SOLUTIONS</h1>
              <p className="text-black/90 text-lg mb-6">Professional Business Management</p>
              
              {/* Receipt Number Badge */}
              <div className="inline-block bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-black font-semibold text-lg">{receiptNumber}</span>
              </div>
            </div>

            {/* Main Body - White Background */}
            <div className="px-8 py-8">
              {/* Bill To and Receipt Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Bill To Section */}
                <div>
                  <h3 className="text-brand-blue font-semibold text-lg mb-4">BILL TO</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><span className="font-medium">Name:</span> {subscription.user_auth_code?.user_name || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {subscription.user_auth_code?.user_email || 'N/A'}</p>
                    <p><span className="font-medium">UserCode:</span> {subscription.user_auth_code?.code || 'N/A'}</p>
                  </div>
                </div>

                {/* Receipt Details Section */}
                <div>
                  <h3 className="text-brand-blue font-semibold text-lg mb-4">RECEIPT DETAILS</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><span className="font-medium">Date:</span> {formattedDate}</p>
                    <p><span className="font-medium">Start Date:</span> {formatDate(subscription.start_date)}</p>
                    <p><span className="font-medium">Expires:</span> {formatDate(subscription.expiry_date)}</p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Status:</span> 
                      <span className={`${statusColor} px-2 py-1 rounded text-sm font-medium`}>{status}</span>
                    </p>
                    <p><span className="font-medium">Auto Renew:</span> {subscription.auto_renew ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Itemized List */}
              <div className="mb-8">
                <div className="bg-brand-purple text-white px-4 py-3 rounded-t-lg">
                  <div className="grid grid-cols-3 gap-4 font-semibold">
                    <div>ITEM</div>
                    <div className="text-center">PRICE</div>
                    <div className="text-right">TOTAL</div>
                  </div>
                </div>
                <div className="border border-gray-200 border-t-0 rounded-b-lg">
                  {subscription.products && subscription.products.length > 0 ? (
                    subscription.products.map((product, index) => {
                      const productPrice = calculateProductPrice(product);
                      return (
                        <div key={product.id} className={`p-4 ${index !== subscription.products.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <div>
                              <p className="font-semibold text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600">
                                {product.subscription_type.replace('_', ' ').toUpperCase()} - {formatPeriod(product.subscription_period)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                            </div>
                            <div className="text-center">
                              <CurrencyDisplay 
                                pkrAmount={productPrice} 
                                size="md" 
                                className="text-gray-700"
                              />
                            </div>
                            <div className="text-right">
                              <CurrencyDisplay 
                                pkrAmount={productPrice} 
                                size="md" 
                                className="text-brand-blue font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : subscription.product ? (
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{subscription.product.name}</p>
                          <p className="text-sm text-gray-600">
                            {subscription.subscription_type?.replace('_', ' ').toUpperCase()} - {formatPeriod(subscription.subscription_period || '')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{subscription.product.category}</p>
                        </div>
                        <div className="text-center">
                          <CurrencyDisplay 
                            pkrAmount={subscription.custom_price || calculateProductPrice({
                              id: subscription.product.id,
                              name: subscription.product.name,
                              category: subscription.product.category,
                              subscription_type: subscription.subscription_type || 'shared',
                              subscription_period: subscription.subscription_period || '1_month',
                              price: 0
                            })} 
                            size="md" 
                            className="text-gray-700"
                          />
                        </div>
                        <div className="text-right">
                          <CurrencyDisplay 
                            pkrAmount={subscription.custom_price || calculateProductPrice({
                              id: subscription.product.id,
                              name: subscription.product.name,
                              category: subscription.product.category,
                              subscription_type: subscription.subscription_type || 'shared',
                              subscription_period: subscription.subscription_period || '1_month',
                              price: 0
                            })} 
                            size="md" 
                            className="text-blue-600 font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div>
                          <p className="font-semibold text-gray-900">Subscription</p>
                          <p className="text-sm text-gray-600">No products selected</p>
                        </div>
                        <div className="text-center">
                          <CurrencyDisplay 
                            pkrAmount={0} 
                            size="md" 
                            className="text-gray-700"
                          />
                        </div>
                        <div className="text-right">
                          <CurrencyDisplay 
                            pkrAmount={0} 
                            size="md" 
                            className="text-blue-600 font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Amount Section */}
              <div className="bg-brand-blue rounded-lg p-6 mb-8">
                <div className="text-center">
                  <p className="text-white text-lg font-medium mb-2">TOTAL AMOUNT</p>
                  <CurrencyDisplay 
                    pkrAmount={totalPrice} 
                    size="lg" 
                    className="text-white text-4xl font-bold"
                  />
                </div>
              </div>

              {/* Notes Section */}
              {subscription.notes && (
                <div className="mb-8">
                  <h3 className="text-brand-blue font-semibold text-lg mb-4">NOTES</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-brand-blue/20">
                    <p className="text-gray-700">{subscription.notes}</p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-gray-500 text-sm space-y-1">
                <p>Thank you for your business!</p>
                <p>Generated on {formattedDate} at {formattedTime} | DAILYTECH TOOLS SOLUTIONS v1.0</p>
                <p className="text-xs mt-2">
                  For support, contact us at support@toolsy.store
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
