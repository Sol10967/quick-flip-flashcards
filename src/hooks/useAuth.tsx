
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/flashcard';
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType } from './auth/types';
import { checkSubscriptionStatus, createCheckoutSession } from './auth/subscriptionService';
import { signInWithPassword, signUpWithPassword, signOut } from './auth/authService';
import { saveUserToStorage, removeUserFromStorage, loadUserFromStorage } from './auth/storageUtils';

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
        await handleSubscriptionCheck(session.user.id, session.user.email!);
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
        await handleSubscriptionCheck(session.user.id, session.user.email!);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubscriptionCheck = async (userId: string, email: string) => {
    const isPremium = await checkSubscriptionStatus(userId, email);
    
    setUser(prev => prev ? {
      ...prev,
      isPremium
    } : null);

    // Load local data
    const savedUser = loadUserFromStorage();
    if (savedUser) {
      setUser(prev => prev ? {
        ...prev,
        cardsCreatedToday: savedUser.cardsCreatedToday || 0,
        lastCardCreationDate: savedUser.lastCardCreationDate || new Date().toDateString()
      } : null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const { user: newUser, success } = await signInWithPassword(email, password);
    
    if (success && newUser) {
      setUser(newUser);
      saveUserToStorage(newUser);
      await handleSubscriptionCheck(newUser.id, newUser.email);
      return true;
    }
    
    return false;
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    const { user: newUser, success } = await signUpWithPassword(email, password);
    
    if (success && newUser) {
      setUser(newUser);
      saveUserToStorage(newUser);
      return true;
    }
    
    return false;
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    removeUserFromStorage();
  };

  const upgradeUser = async () => {
    await createCheckoutSession();
  };

  const checkSubscription = async () => {
    if (user) {
      await handleSubscriptionCheck(user.id, user.email);
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
