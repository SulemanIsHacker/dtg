import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Lock, Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CredentialsDisplayProps {
  username?: string | null;
  password?: string | null;
  className?: string;
}

export const CredentialsDisplay = ({ username, password, className = '' }: CredentialsDisplayProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (!username && !password) {
    return null;
  }

  return (
    <div className={`p-3 bg-muted/20 rounded-lg border border-border/50 ${className}`}>
      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
        <User className="w-4 h-4 mr-2" />
        Login Credentials
      </h4>
      <div className="space-y-3">
        {username && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Username</label>
            <div className="flex items-center space-x-2">
              <Input
                value={username}
                readOnly
                className="font-mono text-sm bg-muted/30 border-border/50"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(username, 'Username')}
                className="shrink-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
        
        {password && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Password</label>
            <div className="flex items-center space-x-2">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                readOnly
                className="font-mono text-sm bg-muted/30 border-border/50"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPassword(!showPassword)}
                className="shrink-0"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(password, 'Password')}
                className="shrink-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-600 dark:text-yellow-400">
        <Lock className="w-3 h-3 inline mr-1" />
        Keep these credentials secure and don't share them with others.
      </div>
    </div>
  );
};
