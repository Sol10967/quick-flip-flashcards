
import { useState } from 'react';
import { Flashcard } from '../types/flashcard';
import { FlashcardDisplay } from './FlashcardDisplay';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';

interface FlashbankProps {
  cards: Flashcard[];
  onUpgrade: () => void;
  showUpgradePrompt: boolean;
}

export const Flashbank = ({ cards, onUpgrade, showUpgradePrompt }: FlashbankProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">
            FlashBank
          </CardTitle>
          <p className="text-gray-600">
            Card {currentIndex + 1} of {cards.length}
          </p>
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
