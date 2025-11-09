
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkAdminRole: () => Promise<boolean>;
  setTemporaryAdmin: (isAdmin: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = async (): Promise<boolean> => {
    if (!session?.user) {
      console.log('checkAdminRole: No session or user');
      return false;
    }
    
    try {
      console.log('checkAdminRole: Checking for user_id:', session.user.id, 'email:', session.user.email);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();
      
      if (error) {
        console.log('checkAdminRole: Error with single() query:', error);
        // If single() fails, try without single() to see if any admin role exists
        const { data: allRoles, error: allError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);
        console.log('checkAdminRole: All roles for user:', allRoles);
        
        // Check if any role is 'admin'
        const hasAdmin = allRoles?.some(role => role.role === 'admin') || false;
        console.log('checkAdminRole: Has admin role (from all roles):', hasAdmin);
        return hasAdmin;
      }
      
      const isAdmin = !error && data !== null;
      console.log('checkAdminRole: Result:', isAdmin, 'data:', data);
      return isAdmin;
    } catch (err) {
      console.error('checkAdminRole: Exception:', err);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check admin role when session changes
        if (session?.user) {
          setTimeout(async () => {
            const adminStatus = await checkAdminRole();
            setIsAdmin(adminStatus);
            setIsLoading(false);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const adminStatus = await checkAdminRole();
          setIsAdmin(adminStatus);
          setIsLoading(false);
        }, 0);
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Ensure the known admin gets the admin role assigned if missing
    if (!error && email === 'admin@dailytechglobal.com') {
      try {
        // Try to assign admin role via RPC if function exists
        try {
          await supabase.rpc('assign_admin_role', { user_email: email });
        } catch (rpcError) {
          console.log('assign_admin_role RPC not available, checking if role exists');
        }
        
        // Wait a bit for the role to be available, then re-check admin status
        setTimeout(async () => {
          const adminStatus = await checkAdminRole();
          setIsAdmin(adminStatus);
          if (!adminStatus) {
            console.warn('Admin role not found after login. User may need to be added to user_roles table manually.');
          }
        }, 500);
      } catch (e) {
        console.error('Error assigning admin role:', e);
        // Re-check admin status anyway
        setTimeout(async () => {
          const adminStatus = await checkAdminRole();
          setIsAdmin(adminStatus);
        }, 500);
      }
    } else if (!error) {
      // For any successful login, check admin role
      setTimeout(async () => {
        const adminStatus = await checkAdminRole();
        setIsAdmin(adminStatus);
      }, 500);
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAdmin,
      isLoading,
      signIn,
      signUp,
      signOut,
      checkAdminRole,
      setTemporaryAdmin: () => {} // No-op for compatibility
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
