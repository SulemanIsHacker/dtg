import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserAuthCode {
  id: string;
  code: string;
  user_name: string;
  user_email: string;
  is_active: boolean;
  created_at: string;
}

interface UserSubscription {
  id: string;
  user_auth_code_id: string;
  product_id: string;
  subscription_type: 'shared' | 'semi_private' | 'private';
  subscription_period: '1_month' | '3_months' | '6_months' | '1_year' | '2_years' | 'lifetime';
  status: 'active' | 'expiring_soon' | 'expired' | 'cancelled';
  start_date: string;
  expiry_date: string;
  auto_renew: boolean;
  notes: string | null;
  custom_price: number | null;
  username: string | null;
  password: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    main_image_url: string | null;
    category: string;
  };
}

interface SubscriptionAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userAuthCode: UserAuthCode | null;
  subscriptions: UserSubscription[];
  signIn: (code: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  refreshSubscriptions: () => Promise<void>;
}

const SubscriptionAuthContext = createContext<SubscriptionAuthContextType | undefined>(undefined);

export const SubscriptionAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userAuthCode, setUserAuthCode] = useState<UserAuthCode | null>(null);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const { toast } = useToast();

  const signIn = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Validate the auth code
      const { data: authCode, error: authError } = await supabase
        .from('user_auth_codes' as any)
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (authError || !authCode) {
        return { success: false, error: 'Invalid or expired authentication code' };
      }

      // Authentication codes are permanent, no expiration check needed

      setUserAuthCode(authCode as unknown as UserAuthCode);
      setIsAuthenticated(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('subscription_auth_code', code);
      
      // Fetch user subscriptions
      await fetchSubscriptions((authCode as unknown as UserAuthCode).id);
      
      toast({
        title: "Welcome back!",
        description: `Hello ${(authCode as unknown as UserAuthCode).user_name}, you're now logged in.`,
      });

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An error occurred during sign in' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUserAuthCode(null);
    setIsAuthenticated(false);
    setSubscriptions([]);
    localStorage.removeItem('subscription_auth_code');
    
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const fetchSubscriptions = async (authCodeId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .select(`
          id,
          user_auth_code_id,
          product_id,
          subscription_type,
          subscription_period,
          status,
          start_date,
          expiry_date,
          auto_renew,
          notes,
          custom_price,
          username,
          password,
          currency,
          created_at,
          updated_at,
          product:products(
            id,
            name,
            slug,
            description,
            main_image_url,
            category
          )
        `)
        .eq('user_auth_code_id', authCodeId)
        .order('expiry_date', { ascending: true });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        return;
      }

      setSubscriptions((data as unknown as UserSubscription[]) || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const refreshSubscriptions = async () => {
    if (userAuthCode) {
      await fetchSubscriptions(userAuthCode.id);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const storedCode = localStorage.getItem('subscription_auth_code');
        if (storedCode) {
          const result = await signIn(storedCode);
          if (!result.success) {
            localStorage.removeItem('subscription_auth_code');
          }
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        localStorage.removeItem('subscription_auth_code');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // Auto-refresh subscriptions every 5 minutes
  useEffect(() => {
    if (!isAuthenticated || !userAuthCode) return;

    const interval = setInterval(() => {
      refreshSubscriptions();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, userAuthCode]);

  return (
    <SubscriptionAuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      userAuthCode,
      subscriptions,
      signIn,
      signOut,
      refreshSubscriptions
    }}>
      {children}
    </SubscriptionAuthContext.Provider>
  );
};

export const useSubscriptionAuth = () => {
  const context = useContext(SubscriptionAuthContext);
  if (context === undefined) {
    throw new Error('useSubscriptionAuth must be used within a SubscriptionAuthProvider');
  }
  return context;
};
