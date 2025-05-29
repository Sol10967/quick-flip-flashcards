
import { supabase } from "@/integrations/supabase/client";
import { User } from '../../types/flashcard';

export const signInWithPassword = async (email: string, password: string): Promise<{ user: User | null; success: boolean }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return { user: null, success: false };
    }

    if (data.user) {
      const userSession: User = {
        id: data.user.id,
        email: data.user.email!,
        isPremium: false,
        cardsCreatedToday: 0,
        lastCardCreationDate: new Date().toDateString()
      };
      return { user: userSession, success: true };
    }

    return { user: null, success: false };
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, success: false };
  }
};

export const signUpWithPassword = async (email: string, password: string): Promise<{ user: User | null; success: boolean }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Signup error:', error);
      return { user: null, success: false };
    }

    if (data.user) {
      const userSession: User = {
        id: data.user.id,
        email: data.user.email!,
        isPremium: false,
        cardsCreatedToday: 0,
        lastCardCreationDate: new Date().toDateString()
      };
      return { user: userSession, success: true };
    }

    return { user: null, success: false };
  } catch (error) {
    console.error('Signup error:', error);
    return { user: null, success: false };
  }
};

export const signOut = async (): Promise<void> => {
  try {
    console.log('Logging out user...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
    } else {
      console.log('Logout successful');
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};
