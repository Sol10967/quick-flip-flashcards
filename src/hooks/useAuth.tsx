import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/flashcard';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  upgradeUser: () => void;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userSession = {
          id: session.user.id,
          email: session.user.email!,
          isPremium: false,
          cardsCreatedToday: 0,
          lastCardCreationDate: new Date().toDateString()
        };
        setUser(userSession);
        await checkSubscriptionStatus(session.user.id, session.user.email!);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userSession = {
          id: session.user.id,
          email: session.user.email!,
          isPremium: false,
          cardsCreatedToday: 0,
          lastCardCreationDate: new Date().toDateString()
        };
        setUser(userSession);
        await checkSubscriptionStatus(session.user.id, session.user.email!);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSubscriptionStatus = async (userId: string, email: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      // Update user state with subscription status
      setUser(prev => prev ? {
        ...prev,
        isPremium: data.subscribed || false
      } : null);

      // Load local data
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(prev => prev ? {
          ...prev,
          cardsCreatedToday: userData.cardsCreatedToday || 0,
          lastCardCreationDate: userData.lastCardCreationDate || new Date().toDateString()
        } : null);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        const userSession = {
          id: data.user.id,
          email: data.user.email!,
          isPremium: false,
          cardsCreatedToday: 0,
          lastCardCreationDate: new Date().toDateString()
        };
        setUser(userSession);
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        await checkSubscriptionStatus(data.user.id, data.user.email!);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Signup error:', error);
        return false;
      }

      if (data.user) {
        const userSession = {
          id: data.user.id,
          email: data.user.email!,
          isPremium: false,
          cardsCreatedToday: 0,
          lastCardCreationDate: new Date().toDateString()
        };
        setUser(userSession);
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Logout button clicked - starting logout process');
    
    try {
      // Clear user state immediately
      setUser(null);
      localStorage.removeItem('currentUser');
      
      // Sign out from Supabase
      supabase.auth.signOut().then(() => {
        console.log('Supabase signout completed');
        // Force navigation to home page after signout
        window.location.href = '/';
      }).catch((error) => {
        console.error('Error during signout:', error);
        // Still redirect even if signout fails
        window.location.href = '/';
      });
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
    } catch (error) {
      console.error('Error in logout function:', error);
      // Force redirect even if there's an error
      window.location.href = '/';
    }
  };

  const upgradeUser = async () => {
    if (isUpgrading) {
      console.log('Upgrade already in progress, ignoring duplicate call');
      return;
    }

    console.log('Upgrade button clicked - starting upgrade process');
    setIsUpgrading(true);
    
    try {
      console.log('Getting current session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast({
          title: "Authentication Error",
          description: "Please sign in again to continue.",
          variant: "destructive"
        });
        return;
      }

      if (!sessionData.session) {
        console.error('No session found - user needs to be logged in');
        toast({
          title: "Not Authenticated",
          description: "Please sign in to upgrade your account.",
          variant: "destructive"
        });
        return;
      }

      console.log('Session found, creating checkout...');
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Create checkout response:', { data, error });

      if (error) {
        console.error('Error creating checkout:', error);
        toast({
          title: "Payment Error",
          description: "Unable to create payment session. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data?.url) {
        console.log('Redirecting to checkout URL:', data.url);
        window.location.href = data.url;
      } else {
        console.error('No checkout URL received in response');
        toast({
          title: "Payment Error",
          description: "Invalid payment response. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in upgradeUser function:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const checkSubscription = async () => {
    if (user) {
      await checkSubscriptionStatus(user.id, user.email);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, upgradeUser, checkSubscription }}>
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
