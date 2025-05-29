
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
      
      // Set a cooler voice - try to find a more modern/engaging voice
      const voices = speechSynthesis.getVoices();
      const coolVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Alex') ||
        voice.name.includes('Daniel')
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      
      if (coolVoice) {
        utterance.voice = coolVoice;
      }
      
      // Make it sound cooler with adjusted rate and pitch
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 0.8; // Lower pitch for a cooler tone
      
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
        <div 
          className={`flashcard w-80 h-56 shadow-lg transition-transform duration-500 ${
            isFlipped ? 'flipped' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            backgroundImage: `url('/lovable-uploads/85cc6496-af3e-453f-a74a-2f4ff11a77f8.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px',
            border: 'none'
          }}
        >
          {/* Front Side */}
          <div 
            className="absolute inset-0 flex items-center justify-center p-6 rounded-lg"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              background: 'rgba(255, 255, 255, 0.95)'
            }}
          >
            <div className="text-center">
              <p className="text-lg font-medium text-gray-800 break-words">{card.front}</p>
              <p className="text-sm text-gray-500 mt-4">Tap to reveal answer</p>
            </div>
          </div>

          {/* Back Side */}
          <div 
            className="absolute inset-0 flex items-center justify-center p-6 rounded-lg"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'rgba(99, 102, 241, 0.1)'
            }}
          >
            <div className="text-center">
              <p className="text-lg text-gray-800 break-words">{card.back}</p>
              <p className="text-sm text-indigo-600 mt-4">Tap to see question</p>
            </div>
          </div>
        </div>
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
