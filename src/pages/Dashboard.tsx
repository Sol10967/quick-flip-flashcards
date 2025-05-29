
import { useState, useEffect, useRef } from 'react';
import { Flashcard } from '../types/flashcard';
import { useAuth } from '../hooks/useAuth';
import { FlashcardCreator } from '../components/FlashcardCreator';
import { Flashbank } from '../components/Flashbank';
import { Header } from '../components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { updateUserData } from '../utils/authUtils';

export const Dashboard = () => {
  const { user, upgradeUser, checkSubscription } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [cardsCreatedToday, setCardsCreatedToday] = useState(0);
  const upgradePromptRef = useRef<HTMLDivElement>(null);

  // Get current GMT date string for consistent daily tracking
  const getCurrentGMTDateString = () => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // Returns YYYY-MM-DD in GMT
  };

  useEffect(() => {
    // Check URL parameters for payment status
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      toast({
        title: "Payment successful!",
        description: "Your subscription has been activated. Refreshing your account status...",
      });
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh subscription status
      checkSubscription();
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment cancelled",
        description: "Your subscription was not activated. You can try again anytime.",
        variant: "destructive"
      });
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkSubscription]);

  useEffect(() => {
    if (user) {
      console.log('Loading cards for user:', user.id);
      
      // Load user's cards - use the authenticated user's ID
      const userCards = JSON.parse(localStorage.getItem(`cards_${user.id}`) || '[]');
      console.log('Found cards for user:', userCards.length);
      setCards(userCards);
      
      // Set cards created today from user object
      setCardsCreatedToday(user.cardsCreatedToday || 0);
      
      // Check subscription status when dashboard loads
      checkSubscription();
    }
  }, [user, checkSubscription]);

  const handleCreateCard = (front: string, back: string): boolean => {
    if (!user) {
      console.error('No user found when creating card');
      return false;
    }

    // Check if user can create more cards
    if (!user.isPremium && cardsCreatedToday >= 5) {
      toast({
        title: "Daily limit reached",
        description: "You've reached your daily limit of 5 cards. Upgrade to Premium for unlimited card creation.",
        variant: "destructive"
      });
      return false;
    }

    const todayGMT = getCurrentGMTDateString();

    const newCard: Flashcard = {
      id: Date.now().toString(),
      front,
      back,
      createdAt: new Date()
    };

    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    
    // Store cards with the authenticated user's ID
    localStorage.setItem(`cards_${user.id}`, JSON.stringify(updatedCards));
    console.log('Saved cards for user:', user.id, 'Total cards:', updatedCards.length);

    // Update daily count
    const newCount = cardsCreatedToday + 1;
    setCardsCreatedToday(newCount);

    // Update user data in localStorage and auth context
    const updatedUser = updateUserData({
      cardsCreatedToday: newCount,
      lastCardCreationDate: todayGMT
    });

    // Auto-scroll to upgrade prompt when hitting the limit
    if (!user?.isPremium && newCount >= 5) {
      setTimeout(() => {
        upgradePromptRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 500);
    }

    toast({
      title: "Flashcard created!",
      description: "Your new flashcard has been added to the flashbank."
    });

    return true;
  };

  const handleDeleteCard = (cardId: string) => {
    if (!user) return;

    const updatedCards = cards.filter(card => card.id !== cardId);
    setCards(updatedCards);
    localStorage.setItem(`cards_${user.id}`, JSON.stringify(updatedCards));
    console.log('Deleted card for user:', user.id, 'Remaining cards:', updatedCards.length);

    toast({
      title: "Flashcard deleted",
      description: "The flashcard has been removed from your flashbank."
    });
  };

  const canCreateCard = user?.isPremium || cardsCreatedToday < 5;
  const showUpgradePrompt = !user?.isPremium && cardsCreatedToday >= 5;

  const handleUpgrade = () => {
    console.log('Dashboard upgrade button clicked');
    upgradeUser();
  };

  const handleManageSubscription = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log('Manage subscription clicked');
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error('No session found for customer portal');
        toast({
          title: "Authentication Error",
          description: "Please sign in again to manage your subscription.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        console.error('Error accessing customer portal:', error);
        toast({
          title: "Error",
          description: "Unable to access subscription management.",
          variant: "destructive"
        });
        return;
      }

      console.log('Customer portal response:', data);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
      toast({
        title: "Error",
        description: "Unable to access subscription management.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url('/lovable-uploads/4752839e-6b2f-482b-96c4-c01b496371b4.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-12">
        {user?.isPremium && (
          <section>
            <Card className="w-full max-w-2xl mx-auto bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <CreditCard className="mx-auto mb-4 text-green-600" size={48} />
                <h3 className="text-xl font-bold text-green-800 mb-2 font-space">
                  Premium Member
                </h3>
                <p className="text-green-700 mb-4 font-space">
                  You have unlimited flashcard creation and premium features.
                </p>
                <Button
                  onClick={handleManageSubscription}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 font-space"
                >
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        <section>
          <FlashcardCreator
            onCreateCard={handleCreateCard}
            canCreateCard={canCreateCard}
            cardsCreatedToday={cardsCreatedToday}
          />
        </section>

        <section ref={upgradePromptRef}>
          <Flashbank
            cards={cards}
            onUpgrade={handleUpgrade}
            showUpgradePrompt={showUpgradePrompt}
            onDeleteCard={handleDeleteCard}
          />
        </section>
      </main>
    </div>
  );
};
