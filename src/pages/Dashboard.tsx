
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
    if (user) {
      // Load user's cards
      const userCards = JSON.parse(localStorage.getItem(`cards_${user.id}`) || '[]');
      setCards(userCards);
      
      // Load and check daily count using GMT date
      const todayGMT = getCurrentGMTDateString();
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      
      if (userIndex !== -1) {
        const userData = users[userIndex];
        if (userData.lastCardCreationDate === todayGMT) {
          // Same day - keep existing count
          setCardsCreatedToday(userData.cardsCreatedToday || 0);
        } else {
          // New day - reset count to 0
          setCardsCreatedToday(0);
          users[userIndex].cardsCreatedToday = 0;
          users[userIndex].lastCardCreationDate = todayGMT;
          localStorage.setItem('users', JSON.stringify(users));
        }
      } else {
        // New user - initialize with today's GMT date
        const newUser = {
          ...user,
          cardsCreatedToday: 0,
          lastCardCreationDate: todayGMT
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
      }

      // Check subscription status when dashboard loads
      checkSubscription();
    }
  }, [user, checkSubscription]);

  const handleCreateCard = (front: string, back: string): boolean => {
    if (!user) return false;

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
    localStorage.setItem(`cards_${user.id}`, JSON.stringify(updatedCards));

    // Update daily count
    const newCount = cardsCreatedToday + 1;
    setCardsCreatedToday(newCount);

    // Update user's daily count in localStorage with GMT date
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].cardsCreatedToday = newCount;
      users[userIndex].lastCardCreationDate = todayGMT;
      localStorage.setItem('users', JSON.stringify(users));
    }

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
  };

  const canCreateCard = user?.isPremium || cardsCreatedToday < 5;
  const showUpgradePrompt = !user?.isPremium && cardsCreatedToday >= 5;

  const handleUpgrade = () => {
    upgradeUser();
  };

  const handleManageSubscription = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

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

      if (data.url) {
        window.open(data.url, '_blank');
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
            showUpgradePrompt={false}
            onDeleteCard={handleDeleteCard}
          />
        </section>

        {showUpgradePrompt && (
          <section className="w-full max-w-2xl mx-auto">
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-6 text-center">
                <CreditCard className="mx-auto mb-4 text-amber-600" size={48} />
                <h3 className="text-xl font-bold text-amber-800 mb-2 font-space">
                  Unlock Unlimited Flashcards!
                </h3>
                <p className="text-amber-700 mb-4 font-space">
                  You've reached your daily limit of 5 cards. Upgrade to Premium for unlimited card creation and an infinite amount of characters!
                </p>
                <Button 
                  onClick={handleUpgrade} 
                  className="bg-amber-600 hover:bg-amber-700 text-white font-space"
                >
                  Upgrade for £10/month
                </Button>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
};
