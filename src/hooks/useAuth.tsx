import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/flashcard';
import { supabase } from "@/integrations/supabase/client";

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
      console.log('Auth state changed:', event, session?.user?.email);
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
        localStorage.removeItem('currentUser');
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

  const logout = async () => {
    console.log('Logout initiated');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        console.log('Logout successful');
        setUser(null);
        localStorage.removeItem('currentUser');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const upgradeUser = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout:', error);
        return;
      }

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error upgrading user:', error);
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
