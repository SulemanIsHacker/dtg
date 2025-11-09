import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const TestProductCodeGeneration = () => {
  const [userName, setUserName] = useState('Test User');
  const [userEmail, setUserEmail] = useState('test@example.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const generateTestProductCodes = async () => {
    try {
      setLoading(true);
      
      // Get a product ID from the products table
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .limit(1);
      
      if (productsError || !products || products.length === 0) {
        throw new Error('No products found in database');
      }
      
      const product = products[0];
      
      // Create test purchase with the product
      const { data, error } = await supabase.rpc('create_simple_purchase' as any, {
        p_user_name: userName,
        p_user_email: userEmail,
        p_products: [
          {
            product_id: product.id,
            subscription_type: 'shared',
            subscription_period: '1_month',
            price: 1000
          }
        ],
        p_currency: 'PKR'
      });

      if (error) {
        throw error;
      }

      setResult(data);
      
      if ((data as any).success) {
        toast({
          title: "Success",
          description: `Generated product codes for ${(data as any).product_codes.length} products`
        });
      } else {
        toast({
          title: "Error",
          description: (data as any).error || "Failed to generate product codes",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error generating product codes:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate product codes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Test Product Code Generation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userName">User Name</Label>
          <Input
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter user name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="userEmail">User Email</Label>
          <Input
            id="userEmail"
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Enter user email"
          />
        </div>
        
        <Button 
          onClick={generateTestProductCodes} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Generating...' : 'Generate Test Product Codes'}
        </Button>
        
        {result && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
