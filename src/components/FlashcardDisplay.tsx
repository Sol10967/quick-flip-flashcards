
import { useState } from 'react';
import { Flashcard } from '../types/flashcard';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface FlashcardDisplayProps {
  card: Flashcard;
}

export const FlashcardDisplay = ({ card }: FlashcardDisplayProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReadAloud = () => {
    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const text = isFlipped ? card.back : card.front;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsReading(false);
      speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  return (
    <div className="relative">
      <div 
        className="flashcard-container cursor-pointer"
        onClick={handleFlip}
        style={{ perspective: '1000px' }}
      >
        <Card 
          className={`flashcard w-80 h-56 shadow-lg transition-transform duration-500 ${
            isFlipped ? 'flipped' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front Side */}
          <CardContent 
            className="absolute inset-0 flex items-center justify-center p-6 bg-white rounded-lg border border-gray-200"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)'
            }}
          >
            <div className="text-center">
              <p className="text-lg font-medium text-gray-800 break-words">{card.front}</p>
              <p className="text-sm text-gray-500 mt-4">Tap to reveal answer</p>
            </div>
          </CardContent>

          {/* Back Side */}
          <CardContent 
            className="absolute inset-0 flex items-center justify-center p-6 bg-indigo-50 rounded-lg border border-indigo-200"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="text-center">
              <p className="text-lg text-gray-800 break-words">{card.back}</p>
              <p className="text-sm text-indigo-600 mt-4">Tap to see question</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Button
        onClick={handleReadAloud}
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white border-gray-300"
      >
        {isReading ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </Button>
    </div>
  );
};
