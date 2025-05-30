import { useState, useEffect } from 'react';
import { Flashcard } from '../types/flashcard';
import { FlashcardDisplay } from './FlashcardDisplay';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CreditCard, Minimize, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';

interface FlashbankProps {
  cards: Flashcard[];
  onUpgrade: () => void;
  showUpgradePrompt: boolean;
  onDeleteCard: (cardId: string) => void;
}

export const Flashbank = ({
  cards,
  onUpgrade,
  showUpgradePrompt,
  onDeleteCard
}: FlashbankProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardKey, setCardKey] = useState(0); // Key to force re-render and reset flip state
  const isMobile = useIsMobile();

  // Adjust current index if it's out of bounds after deletion
  useEffect(() => {
    if (cards.length > 0 && currentIndex >= cards.length) {
      setCurrentIndex(cards.length - 1);
    }
  }, [cards.length, currentIndex]);

  // Handle viewport height on mobile
  useEffect(() => {
    if (isFullscreen && isMobile) {
      // Set viewport height to actual screen height on mobile
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      setVH();
      window.addEventListener('resize', setVH);
      window.addEventListener('orientationchange', setVH);
      
      return () => {
        window.removeEventListener('resize', setVH);
        window.removeEventListener('orientationchange', setVH);
        document.documentElement.style.removeProperty('--vh');
      };
    }
  }, [isFullscreen, isMobile]);

  if (cards.length === 0) {
    
    return (
      <div className="space-y-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 text-lg font-space">Your flashbank is empty</p>
            <p className="text-gray-400 text-sm mt-2 font-space">Create your first flashcard above!</p>
          </CardContent>
        </Card>
        
        {showUpgradePrompt && (
          <Card className="border-amber-200 bg-amber-50 w-full max-w-2xl mx-auto">
            <CardContent className="p-6 text-center">
              <CreditCard className="mx-auto mb-4 text-amber-600" size={48} />
              <h3 className="text-xl font-bold text-amber-800 mb-2 font-space">
                Unlock Unlimited Flashcards!
              </h3>
              <p className="text-amber-700 mb-4 font-space">You've reached your daily limit of 5 cards. Upgrade to Premium for unlimited card creation and an infinite amount of characters!</p>
              <Button onClick={onUpgrade} className="bg-amber-600 hover:bg-amber-700 text-white font-space">
                Upgrade for £10/month
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev > 0 ? prev - 1 : cards.length - 1);
      setCardKey(prev => prev + 1); // Force re-render to reset flip state
      setIsAnimating(false);
    }, 150);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev < cards.length - 1 ? prev + 1 : 0);
      setCardKey(prev => prev + 1); // Force re-render to reset flip state
      setIsAnimating(false);
    }, 150);
  };

  const handleDeleteCard = () => {
    if (cards[currentIndex]) {
      onDeleteCard(cards[currentIndex].id);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsFullscreen(false);
    } else if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  if (isFullscreen) {
    return (
      <div 
        className="fixed inset-0 z-50 flex flex-col"
        style={{
          backgroundImage: 'url(/lovable-uploads/bb37e6bf-2b30-4799-b39f-13ac83221e6e.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: isMobile ? 'calc(var(--vh, 1vh) * 100)' : '100vh'
        }} 
        onKeyDown={handleKeyDown} 
        tabIndex={0}
      >
        
        <div className={`flex-shrink-0 flex ${isMobile ? 'flex-col' : 'flex-row'} justify-between items-center p-4 ${isMobile ? 'pt-safe-top' : ''}`}>
          <div className={`${isMobile ? 'order-2 mt-2' : 'order-1'}`}>
            <p className={`text-white font-bold font-space drop-shadow-lg ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              Card {currentIndex + 1} of {cards.length}
            </p>
          </div>
          <div className={`${isMobile ? 'order-1 self-end' : 'order-2'}`}>
            <Button onClick={toggleFullscreen} variant="outline" size="sm" className="bg-white/90 hover:bg-white font-space">
              <Minimize size={16} />
              {isMobile ? '' : 'Exit Fullscreen'}
            </Button>
          </div>
        </div>
        
        
        <div className="flex-1 flex items-center justify-center px-4 min-h-0">
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            <div className={`${isMobile ? 'scale-100' : 'transform scale-[2]'}`}>
              <FlashcardDisplay key={cardKey} card={cards[currentIndex]} onDelete={handleDeleteCard} />
            </div>
          </div>
        </div>
        
        
        <div className={`flex-shrink-0 flex justify-center items-center space-x-8 ${isMobile ? 'pb-safe-bottom pb-4' : 'pb-16'}`}>
          <Button 
            onClick={handlePrevious} 
            size={isMobile ? "default" : "lg"} 
            variant="outline" 
            className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-white/90 hover:bg-white transition-colors disabled:opacity-50 border-2`} 
            disabled={cards.length <= 1 || isAnimating}
          >
            <ChevronLeft size={isMobile ? 20 : 24} />
          </Button>
          
          <Button 
            onClick={handleNext} 
            size={isMobile ? "default" : "lg"} 
            variant="outline" 
            className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-white/90 hover:bg-white transition-colors disabled:opacity-50 border-2`} 
            disabled={cards.length <= 1 || isAnimating}
          >
            <ChevronRight size={isMobile ? 20 : 24} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <CardTitle className="text-2xl font-bold text-gray-800 font-space">
                FlashBank
              </CardTitle>
              <p className="text-gray-600 font-space">
                Card {currentIndex + 1} of {cards.length}
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Button onClick={toggleFullscreen} variant="outline" size="sm" className="w-10 h-10 rounded-md bg-white hover:bg-gray-50 transition-colors border border-gray-300">
                <Maximize size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center space-y-6">
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            <FlashcardDisplay key={cardKey} card={cards[currentIndex]} onDelete={handleDeleteCard} />
          </div>
          
          <div className="flex items-center space-x-4">
            <Button onClick={handlePrevious} size="lg" variant="outline" className="w-16 h-16 rounded-full bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-md border-2" disabled={cards.length <= 1 || isAnimating}>
              <ChevronLeft size={24} />
            </Button>
            
            <Button onClick={handleNext} size="lg" variant="outline" className="w-16 h-16 rounded-full bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-md border-2" disabled={cards.length <= 1 || isAnimating}>
              <ChevronRight size={24} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {showUpgradePrompt && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-center">
            <CreditCard className="mx-auto mb-4 text-amber-600" size={48} />
            <h3 className="text-xl font-bold text-amber-800 mb-2 font-space">
              Unlock Unlimited Flashcards!
            </h3>
            <p className="text-amber-700 mb-4 font-space">You've reached your daily limit of 5 cards. Upgrade to Premium for unlimited card creation and an infinite amount of characters!</p>
            <Button onClick={onUpgrade} className="bg-amber-600 hover:bg-amber-700 text-white font-space">
              Upgrade for £10/month
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
