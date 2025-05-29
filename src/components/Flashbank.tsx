
import { useState } from 'react';
import { Flashcard } from '../types/flashcard';
import { FlashcardDisplay } from './FlashcardDisplay';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CreditCard, Minimize, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';

interface FlashbankProps {
  cards: Flashcard[];
  onUpgrade: () => void;
  showUpgradePrompt: boolean;
}

export const Flashbank = ({ cards, onUpgrade, showUpgradePrompt }: FlashbankProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
      setIsAnimating(false);
    }, 150);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
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

  if (isFullscreen) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3880&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white font-space"
          >
            <Minimize size={16} />
            Exit Fullscreen
          </Button>
          
          <div className="text-center mb-6">
            <p className="text-white text-lg font-medium font-space drop-shadow-lg">
              Card {currentIndex + 1} of {cards.length}
            </p>
          </div>
          
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            <FlashcardDisplay card={cards[currentIndex]} />
          </div>
          
          <div className="flex items-center space-x-6 mt-8">
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
          
          <p className="text-white/70 text-sm mt-4 font-space drop-shadow-md">
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
            <FlashcardDisplay card={cards[currentIndex]} />
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
              You've reached your daily limit of 5 cards. Upgrade to Premium for unlimited card creation.
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
