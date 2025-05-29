
import { supabase } from "@/integrations/supabase/client";

export const checkSubscriptionStatus = async (userId: string, email: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return false;

    const { data, error } = await supabase.functions.invoke('check-subscription', {
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
    });

    if (error) {
      console.error('Error checking subscription:', error);
      return false;
    }

    return data.subscribed || false;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

export const createCheckoutSession = async () => {
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

export const accessCustomerPortal = async () => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return null;

    const { data, error } = await supabase.functions.invoke('customer-portal', {
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
    });

    if (error) {
      console.error('Error accessing customer portal:', error);
      return null;
    }

    return data.url;
  } catch (error) {
    console.error('Error managing subscription:', error);
    return null;
  }
};
