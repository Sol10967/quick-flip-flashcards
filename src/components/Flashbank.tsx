
import { useState } from 'react';
import { Flashcard } from '../types/flashcard';
import { FlashcardDisplay } from './FlashcardDisplay';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChevronLeft, ChevronRight, CreditCard, Maximize, Minimize } from 'lucide-react';

interface FlashbankProps {
  cards: Flashcard[];
  onUpgrade: () => void;
  showUpgradePrompt: boolean;
}

export const Flashbank = ({ cards, onUpgrade, showUpgradePrompt }: FlashbankProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (cards.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 text-lg">Your flashbank is empty</p>
          <p className="text-gray-400 text-sm mt-2">Create your first flashcard above!</p>
        </CardContent>
      </Card>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
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
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white"
          >
            <Minimize size={16} />
            Exit Fullscreen
          </Button>
          
          <div className="text-center mb-6">
            <p className="text-white text-lg font-medium">
              Card {currentIndex + 1} of {cards.length}
            </p>
          </div>
          
          <FlashcardDisplay card={cards[currentIndex]} />
          
          <div className="flex items-center space-x-6 mt-8">
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="flex items-center gap-2 bg-white/90 hover:bg-white"
              disabled={cards.length <= 1}
            >
              <ChevronLeft size={20} />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              variant="outline"
              className="flex items-center gap-2 bg-white/90 hover:bg-white"
              disabled={cards.length <= 1}
            >
              Next
              <ChevronRight size={20} />
            </Button>
          </div>
          
          <p className="text-white/70 text-sm mt-4">
            Use arrow keys to navigate or ESC to exit fullscreen
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-800">
                FlashBank
              </CardTitle>
              <p className="text-gray-600">
                Card {currentIndex + 1} of {cards.length}
              </p>
            </div>
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Maximize size={16} />
              Fullscreen
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center space-y-6">
          <FlashcardDisplay card={cards[currentIndex]} />
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="flex items-center gap-2"
              disabled={cards.length <= 1}
            >
              <ChevronLeft size={20} />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              variant="outline"
              className="flex items-center gap-2"
              disabled={cards.length <= 1}
            >
              Next
              <ChevronRight size={20} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {showUpgradePrompt && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-center">
            <CreditCard className="mx-auto mb-4 text-amber-600" size={48} />
            <h3 className="text-xl font-bold text-amber-800 mb-2">
              Unlock Unlimited Flashcards!
            </h3>
            <p className="text-amber-700 mb-4">
              You've reached your daily limit of 5 cards. Upgrade to Premium for unlimited card creation.
            </p>
            <Button
              onClick={onUpgrade}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Upgrade for £10/month
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
