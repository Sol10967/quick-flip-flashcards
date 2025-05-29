
import { useState } from 'react';
import { Flashcard } from '../types/flashcard';
import { FlashcardDisplay } from './FlashcardDisplay';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CreditCard, Minimize } from 'lucide-react';

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
            <button
              onClick={handlePrevious}
              className="w-16 h-16 rounded-full bg-white/90 hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={cards.length <= 1}
            >
              <img 
                src="/lovable-uploads/9531331e-9a5f-4ab9-b4c8-57ecd9ab65d6.png" 
                alt="Previous" 
                className="w-8 h-8 object-contain transform rotate-180"
              />
            </button>
            
            <button
              onClick={handleNext}
              className="w-16 h-16 rounded-full bg-white/90 hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={cards.length <= 1}
            >
              <img 
                src="/lovable-uploads/9531331e-9a5f-4ab9-b4c8-57ecd9ab65d6.png" 
                alt="Next" 
                className="w-8 h-8 object-contain"
              />
            </button>
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
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                FlashBank
              </CardTitle>
              <p className="text-gray-600">
                Card {currentIndex + 1} of {cards.length}
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-md bg-white hover:bg-gray-50 transition-colors border border-gray-300 flex items-center justify-center"
              >
                <img 
                  src="/lovable-uploads/e31e161f-f3cd-41b0-9cf0-fb333362e199.png" 
                  alt="Fullscreen" 
                  className="w-5 h-5 object-contain"
                />
              </button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center space-y-6">
          <FlashcardDisplay card={cards[currentIndex]} />
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevious}
              className="w-16 h-16 rounded-full bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-md flex items-center justify-center"
              disabled={cards.length <= 1}
            >
              <img 
                src="/lovable-uploads/9531331e-9a5f-4ab9-b4c8-57ecd9ab65d6.png" 
                alt="Previous" 
                className="w-8 h-8 object-contain transform rotate-180"
              />
            </button>
            
            <button
              onClick={handleNext}
              className="w-16 h-16 rounded-full bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-md flex items-center justify-center"
              disabled={cards.length <= 1}
            >
              <img 
                src="/lovable-uploads/9531331e-9a5f-4ab9-b4c8-57ecd9ab65d6.png" 
                alt="Next" 
                className="w-8 h-8 object-contain"
              />
            </button>
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
