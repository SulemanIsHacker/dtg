import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SubscriptionReceipt } from './SubscriptionReceipt';
import { Receipt } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  subscription_type: string;
  subscription_period: string;
  price: number;
  custom_price?: number | null;
}

interface ReceiptIntegrationProps {
  subscription: {
    id: string;
    start_date: string;
    expiry_date: string;
    auto_renew: boolean;
    notes?: string | null;
    user_auth_code?: {
      user_name: string;
      user_email: string;
      code: string;
    };
    products?: Product[];
  };
}

export const ReceiptIntegration = ({ subscription }: ReceiptIntegrationProps) => {
  const [showReceipt, setShowReceipt] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setShowReceipt(true)}
        variant="outline"
        className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
      >
        <Receipt className="w-4 h-4" />
        View Receipt
      </Button>

      {showReceipt && (
        <SubscriptionReceipt 
          subscription={subscription}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
};
