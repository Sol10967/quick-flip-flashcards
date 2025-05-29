
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';
import { User } from '../types/flashcard';

export const checkSubscriptionStatus = async (userId: string, email: string) => {
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

    return data;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return null;
  }
};

const syncUserDataToLocalStorage = (user: User) => {
  // Store current user data
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  // Update users array for backward compatibility
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex((u: any) => u.id === user.id);
  
  if (userIndex !== -1) {
    users[userIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem('users', JSON.stringify(users));
};

const getCurrentGMTDateString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // Returns YYYY-MM-DD in GMT
};

export const performLogin = async (email: string, password: string): Promise<{ success: boolean; user?: User }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return { success: false };
    }

    if (data.user) {
      const todayGMT = getCurrentGMTDateString();
      
      // Get existing user data from localStorage or create new
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = existingUsers.find((u: any) => u.id === data.user.id);
      
      let cardsCreatedToday = 0;
      let lastCardCreationDate = todayGMT;
      
      if (existingUser) {
        // Check if it's the same day
        if (existingUser.lastCardCreationDate === todayGMT) {
          cardsCreatedToday = existingUser.cardsCreatedToday || 0;
        }
        lastCardCreationDate = existingUser.lastCardCreationDate || todayGMT;
      }

      const userSession = {
        id: data.user.id,
        email: data.user.email!,
        isPremium: false, // Will be updated by subscription check
        cardsCreatedToday,
        lastCardCreationDate
      };
      
      syncUserDataToLocalStorage(userSession);
      return { success: true, user: userSession };
    }

    return { success: false };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false };
  }
};

export const performSignup = async (email: string, password: string): Promise<{ success: boolean; user?: User }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Signup error:', error);
      return { success: false };
    }

    if (data.user) {
      const todayGMT = getCurrentGMTDateString();
      
      const userSession = {
        id: data.user.id,
        email: data.user.email!,
        isPremium: false,
        cardsCreatedToday: 0,
        lastCardCreationDate: todayGMT
      };
      
      syncUserDataToLocalStorage(userSession);
      return { success: true, user: userSession };
    }

    return { success: false };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false };
  }
};

export const performLogout = () => {
  console.log('Logout button clicked - starting logout process');
  
  try {
    // Clear local storage
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

export const performUpgrade = async (): Promise<boolean> => {
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
      return false;
    }

    if (!sessionData.session) {
      console.error('No session found - user needs to be logged in');
      toast({
        title: "Not Authenticated",
        description: "Please sign in to upgrade your account.",
        variant: "destructive"
      });
      return false;
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
      return false;
    }

    if (data?.url) {
      console.log('Redirecting to checkout URL:', data.url);
      // Immediately redirect to Stripe checkout
      window.location.href = data.url;
      return true;
    } else {
      console.error('No checkout URL received in response');
      toast({
        title: "Payment Error",
        description: "Invalid payment response. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  } catch (error) {
    console.error('Error in upgrade function:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

export const updateUserData = (userData: Partial<User>) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (currentUser) {
    const updatedUser = { ...currentUser, ...userData };
    syncUserDataToLocalStorage(updatedUser);
    return updatedUser;
  }
  return null;
};
