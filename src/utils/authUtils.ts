
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
      const userSession = {
        id: data.user.id,
        email: data.user.email!,
        isPremium: false,
        cardsCreatedToday: 0,
        lastCardCreationDate: new Date().toDateString()
      };
      localStorage.setItem('currentUser', JSON.stringify(userSession));
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
      const userSession = {
        id: data.user.id,
        email: data.user.email!,
        isPremium: false,
        cardsCreatedToday: 0,
        lastCardCreationDate: new Date().toDateString()
      };
      localStorage.setItem('currentUser', JSON.stringify(userSession));
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
