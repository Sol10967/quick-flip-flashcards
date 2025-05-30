
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
  performUpgrade,
  updateUserData
} from '../utils/authUtils';
import { useContext } from 'react';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    // Check for existing session first
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('Found existing session for user:', session.user.id);
        await handleAuthenticatedUser(session.user.id, session.user.email!);
      } else {
        // Check localStorage for current user (fallback)
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
          } catch (error) {
            console.error('Error parsing saved user data:', error);
            localStorage.removeItem('currentUser');
          }
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        await handleAuthenticatedUser(session.user.id, session.user.email!);
      } else {
        setUser(null);
        localStorage.removeItem('currentUser');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthenticatedUser = async (userId: string, email: string) => {
    // Get existing user data from localStorage
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = existingUsers.find((u: any) => u.id === userId);
    
    const getCurrentGMTDateString = () => {
      const now = new Date();
      return now.toISOString().split('T')[0];
    };
    
    const todayGMT = getCurrentGMTDateString();
    let cardsCreatedToday = 0;
    let lastCardCreationDate = todayGMT;
    
    if (existingUser) {
      if (existingUser.lastCardCreationDate === todayGMT) {
        cardsCreatedToday = existingUser.cardsCreatedToday || 0;
      }
      lastCardCreationDate = existingUser.lastCardCreationDate || todayGMT;
    }

    const userSession = {
      id: userId,
      email: email,
      isPremium: false,
      cardsCreatedToday,
      lastCardCreationDate
    };
    
    setUser(userSession);
    localStorage.setItem('currentUser', JSON.stringify(userSession));
    
    // Update subscription status
    await updateSubscriptionStatus(userId, email);
  };

  const updateSubscriptionStatus = async (userId: string, email: string) => {
    const subscriptionData = await checkSubscriptionStatus(userId, email);
    
    if (subscriptionData) {
      const updatedUser = updateUserData({
        isPremium: subscriptionData.subscribed || false
      });
      if (updatedUser) {
        setUser(updatedUser);
      }
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
