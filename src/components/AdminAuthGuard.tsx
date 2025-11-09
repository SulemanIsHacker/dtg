
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export const AdminAuthGuard = ({ children }: AdminAuthGuardProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/30 via-background to-brand-teal/20">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-destructive">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin panel.
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact an administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
