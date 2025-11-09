
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminLogin = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message || 'Invalid credentials. Please check your email and password.',
          variant: 'destructive',
        });
      } else {
        // Wait a moment for admin role check to complete
        setTimeout(() => {
          toast({
            title: 'Login Successful',
            description: 'Welcome to the admin panel!',
          });
          // Check admin status before redirecting
          setTimeout(() => {
            navigate('/admin', { replace: true });
          }, 1000);
        }, 500);
      }
    } catch (err) {
      toast({
        title: 'Login Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/30 via-background to-brand-teal/20">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl animate-fade-in-up border-0">
        <CardHeader>
          <div className="flex flex-col items-center mb-2">
            <img src="/dtg.jpeg" alt="DAILYTECH TOOLS SOLUTIONS Logo" className="w-16 h-16 rounded-full shadow-lg mb-2" />
            <CardTitle className="text-center text-3xl font-extrabold bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent font-montserrat tracking-tight">
              Admin Login
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="font-semibold text-base">Email</Label>
              <Input
                id="email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your admin email"
                className="mt-1 py-2 px-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="font-semibold text-base">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                className="mt-1 py-2 px-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                disabled={isLoading}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-2 text-lg font-bold rounded-lg bg-gradient-to-r from-primary to-brand-teal shadow-md hover:scale-105 transition-transform"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
