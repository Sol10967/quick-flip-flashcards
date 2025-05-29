
import { useState } from 'react';
import { Flashcard } from '../types/flashcard';
import { FlashcardDisplay } from './FlashcardDisplay';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CreditCard, Minimize, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

  // Adjust currentIndex if it's out of bounds after deletion
  if (currentIndex >= cards.length && cards.length > 0) {
    setCurrentIndex(cards.length - 1);
  }

  if (cards.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 text-lg font-space">Your flashbank is empty</p>
          <p className="text-gray-400 text-sm mt-2 font-space">Create your first flashcard above!</p>
        </CardContent>
      </Card>
    );
  }

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev > 0 ? prev - 1 : cards.length - 1);
      setIsAnimating(false);
    }, 150);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev < cards.length - 1 ? prev + 1 : 0);
      setIsAnimating(false);
    }, 150);
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

  const handleDeleteCard = () => {
    const currentCard = cards[currentIndex];
    onDeleteCard(currentCard.id);
    
    toast({
      title: "Flashcard deleted",
      description: "The flashcard has been removed from your flashbank."
    });

    // Adjust index after deletion
    if (cards.length === 1) {
      // Last card being deleted, no need to adjust index
      return;
    } else if (currentIndex === cards.length - 1) {
      // Deleting the last card, move to previous
      setCurrentIndex(currentIndex - 1);
    }
    // If deleting any other card, currentIndex stays the same (shows next card)
  };

  if (isFullscreen) {
    return (
      <div 
        className="fixed inset-0 z-50 flex flex-col" 
        style={{
          backgroundImage: 'url(/lovable-uploads/bb37e6bf-2b30-4799-b39f-13ac83221e6e.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }} 
        onKeyDown={handleKeyDown} 
        tabIndex={0}
      >
        {/* Exit button */}
        <div className="absolute top-4 right-4">
          <Button 
            onClick={toggleFullscreen} 
            variant="outline" 
            size="sm" 
            className="bg-white/90 hover:bg-white font-space"
          >
            <Minimize size={16} />
            Exit Fullscreen
          </Button>
        </div>
        
        {/* Card counter */}
        <div className="flex-shrink-0 text-center pt-16 pb-8">
          <p className="text-white text-2xl font-bold font-space drop-shadow-lg">
            Card {currentIndex + 1} of {cards.length}
          </p>
        </div>
        
        {/* Centered flashcard */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="transform scale-[2]">
              <FlashcardDisplay 
                card={cards[currentIndex]} 
                onDelete={handleDeleteCard}
                showDeleteButton={true}
              />
            </div>
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex-shrink-0 flex justify-center items-center space-x-8 pb-16">
          <Button 
            onClick={handlePrevious} 
            size="lg" 
            variant="outline" 
            className="w-16 h-16 rounded-full bg-white/90 hover:bg-white transition-colors disabled:opacity-50 border-2" 
            disabled={cards.length <= 1 || isAnimating}
          >
            <ChevronLeft size={24} />
          </Button>
          
          <Button 
            onClick={handleNext} 
            size="lg" 
            variant="outline" 
            className="w-16 h-16 rounded-full bg-white/90 hover:bg-white transition-colors disabled:opacity-50 border-2" 
            disabled={cards.length <= 1 || isAnimating}
          >
            <ChevronRight size={24} />
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
              <Button 
                onClick={toggleFullscreen} 
                variant="outline" 
                size="sm" 
                className="w-10 h-10 rounded-md bg-white hover:bg-gray-50 transition-colors border border-gray-300"
              >
                <Maximize size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center space-y-6">
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            <FlashcardDisplay 
              card={cards[currentIndex]} 
              onDelete={handleDeleteCard}
              showDeleteButton={true}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handlePrevious} 
              size="lg" 
              variant="outline" 
              className="w-16 h-16 rounded-full bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-md border-2" 
              disabled={cards.length <= 1 || isAnimating}
            >
              <ChevronLeft size={24} />
            </Button>
            
            <Button 
              onClick={handleNext} 
              size="lg" 
              variant="outline" 
              className="w-16 h-16 rounded-full bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-md border-2" 
              disabled={cards.length <= 1 || isAnimating}
            >
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
            <p className="text-amber-700 mb-4 font-space">
              You've reached your daily limit of 5 cards. Upgrade to Premium for unlimited card creation and an infinite amount of characters!
            </p>
            <Button 
              onClick={onUpgrade} 
              className="bg-amber-600 hover:bg-amber-700 text-white font-space"
            >
              Upgrade for £10/month
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
