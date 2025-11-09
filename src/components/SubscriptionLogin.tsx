import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Key, User, Mail } from 'lucide-react';
import { useSubscriptionAuth } from '@/hooks/useSubscriptionAuth';

export const SubscriptionLogin = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useSubscriptionAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter your authentication code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(code.trim());
      if (!result.success) {
        setError(result.error || 'Invalid authentication code');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card/30 to-background p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-teal/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Card className="w-full max-w-md bg-card/95 backdrop-blur-md shadow-2xl border border-border/50 relative z-10">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-brand-teal/20 rounded-full flex items-center justify-center mb-6 shadow-lg border border-primary/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-brand-teal/10 rounded-full animate-pulse"></div>
            <Key className="w-8 h-8 text-primary relative z-10 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-brand-teal to-brand-purple bg-clip-text text-transparent">Subscription Dashboard</CardTitle>
          <CardDescription className="text-muted-foreground mt-2 text-base">
            Enter your authentication code to access your subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="code" className="text-foreground font-medium text-sm">Authentication Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter your code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
                className="text-center font-mono text-lg bg-input border-border focus:border-primary focus:ring-primary/50 focus:ring-2 transition-all duration-300 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertDescription className="text-destructive-foreground">{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-brand-teal hover:from-primary/90 hover:to-brand-teal/90 text-primary-foreground font-medium py-3 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group" 
              disabled={isLoading || !code.trim()}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-brand-teal/20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin relative z-10" />
                  <span className="relative z-10">Signing In...</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">Access Dashboard</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-3">Need help accessing your account?</p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm text-primary hover:text-brand-teal transition-colors duration-300 group"
                onClick={() => window.open('mailto:support@toolsy.store?subject=Subscription Access Help')}
              >
                <Mail className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
