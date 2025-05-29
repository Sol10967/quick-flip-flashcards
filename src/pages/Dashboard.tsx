
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (user) {
      // Load user's cards
      const userCards = JSON.parse(localStorage.getItem(`cards_${user.id}`) || '[]');
      setCards(userCards);
      
      // Check daily limit
      const today = new Date().toDateString();
      if (user.lastCardCreationDate === today) {
        setCardsCreatedToday(user.cardsCreatedToday);
      } else {
        setCardsCreatedToday(0);
        // Reset daily count in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex].cardsCreatedToday = 0;
          users[userIndex].lastCardCreationDate = today;
          localStorage.setItem('users', JSON.stringify(users));
        }
      }

      // Check subscription status when dashboard loads
      checkSubscription();
    }
  }, [user, checkSubscription]);

  const handleCreateCard = (front: string, back: string): boolean => {
    if (!user) return false;

    const today = new Date().toDateString();
    
    // Check if user can create more cards
    if (!user.isPremium && cardsCreatedToday >= 5) {
      toast({
        title: "Daily limit reached",
        description: "Upgrade to Premium for unlimited cards!",
        variant: "destructive"
      });
      return false;
    }

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

    // Update user's daily count in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].cardsCreatedToday = newCount;
      users[userIndex].lastCardCreationDate = today;
      localStorage.setItem('users', JSON.stringify(users));
    }

    toast({
      title: "Flashcard created!",
      description: "Your new flashcard has been added to the flashbank."
    });

    return true;
  };

  const canCreateCard = user?.isPremium || cardsCreatedToday < 5;
  const showUpgradePrompt = !user?.isPremium && cards.length >= 5;

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

        <section>
          <Flashbank
            cards={cards}
            onUpgrade={handleUpgrade}
            showUpgradePrompt={showUpgradePrompt}
          />
        </section>
      </main>
    </div>
  );
};
