
import { useState, useEffect } from 'react';
import { User } from '../types/flashcard';
import { supabase } from "@/integrations/supabase/client";
import { AuthProviderProps } from '../types/auth';
import { AuthContext } from '../contexts/AuthContext';
import { 
  checkSubscriptionStatus, 
  performLogin, 
  performSignup, 
  performLogout, 
  performUpgrade 
} from '../utils/authUtils';
import { useContext } from 'react';

export const AuthProvider = ({ children }: AuthProviderProps) => {
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
        await updateSubscriptionStatus(session.user.id, session.user.email!);
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
        await updateSubscriptionStatus(session.user.id, session.user.email!);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateSubscriptionStatus = async (userId: string, email: string) => {
    const subscriptionData = await checkSubscriptionStatus(userId, email);
    
    if (subscriptionData) {
      // Update user state with subscription status
      setUser(prev => prev ? {
        ...prev,
        isPremium: subscriptionData.subscribed || false
      } : null);
    }

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
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await performLogin(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      await updateSubscriptionStatus(result.user.id, result.user.email);
    }
    return result.success;
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    const result = await performSignup(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result.success;
  };

  const logout = () => {
    setUser(null);
    performLogout();
  };

  const upgradeUser = async () => {
    if (isUpgrading) {
      console.log('Upgrade already in progress, ignoring duplicate call');
      return;
    }

    console.log('Upgrade button clicked - starting upgrade process');
    setIsUpgrading(true);
    
    const success = await performUpgrade();
    setIsUpgrading(false);
    
    if (!success) {
      // Error handling is done in performUpgrade
      return;
    }
  };

  const checkSubscription = async () => {
    if (user) {
      await updateSubscriptionStatus(user.id, user.email);
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
