import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SubscriptionReceipt } from '@/components/SubscriptionReceipt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ReceiptDemo = () => {
  const [showReceipt, setShowReceipt] = useState(false);

  // Sample subscription data for demo with multiple products
  const sampleSubscription = {
    id: 'sub-123',
    start_date: '2024-01-01',
    expiry_date: '2024-02-01',
    auto_renew: false,
    notes: 'Premium subscription with full access',
    user_auth_code: {
      user_name: 'Suleman Shahzad',
      user_email: 'suleman@example.com',
      code: '2348141988239'
    },
    products: [
      {
        id: 'prod-1',
        name: 'Google Pro Plan',
        category: 'productivity',
        subscription_type: 'private',
        subscription_period: '1_month',
        price: 500,
        custom_price: 1100
      },
      {
        id: 'prod-2',
        name: 'ChatGPT Plus',
        category: 'ai',
        subscription_type: 'shared',
        subscription_period: '1_month',
        price: 300
      },
      {
        id: 'prod-3',
        name: 'Canva Pro',
        category: 'design',
        subscription_type: 'semi_private',
        subscription_period: '3_months',
        price: 200
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Beautiful Receipt Template</h1>
          <p className="text-lg text-gray-600">
            A stunning receipt template inspired by modern design principles with a purple theme
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Receipt Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Click the button below to see the beautiful receipt template in action
              </p>
              <Button 
                onClick={() => setShowReceipt(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-lg"
              >
                View Receipt
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li>• Beautiful blue gradient header</li>
                <li>• Clean, modern design</li>
                <li>• Professional layout</li>
                <li>• PDF download functionality</li>
                <li>• Responsive design</li>
                <li>• High-quality print output</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Design Elements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li>• Blue brand colors</li>
                <li>• Rounded corners and shadows</li>
                <li>• Professional typography</li>
                <li>• Status badges and indicators</li>
                <li>• Itemized pricing table</li>
                <li>• Company branding</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {showReceipt && (
          <SubscriptionReceipt 
            subscription={sampleSubscription}
            onClose={() => setShowReceipt(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ReceiptDemo;
