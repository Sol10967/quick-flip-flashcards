
import { useState } from 'react';
import { Flashcard } from '../types/flashcard';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface FlashcardDisplayProps {
  card: Flashcard;
}

export const FlashcardDisplay = ({
  card
}: FlashcardDisplayProps) => {
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

      // Set a female voice - prioritize female voices
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('hazel') ||
        voice.name.toLowerCase().includes('susan') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('moira') ||
        voice.name.toLowerCase().includes('tessa') ||
        voice.name.toLowerCase().includes('veena') ||
        voice.name.toLowerCase().includes('fiona') ||
        voice.name.toLowerCase().includes('kate') ||
        voice.name.toLowerCase().includes('serena')
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      // Make it sound pleasant with adjusted rate and pitch
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.1; // Higher pitch for a more feminine tone

      utterance.onend = () => setIsReading(false);
      speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  return (
    <div className="relative">
      <div className="flashcard-container cursor-pointer" onClick={handleFlip} style={{
        perspective: '1000px'
      }}>
        <div className={`flashcard w-80 h-56 shadow-lg transition-transform duration-500 ${isFlipped ? 'flipped' : ''}`} style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          backgroundColor: '#f8f9fa',
          border: '2px solid #e9ecef',
          borderRadius: '12px'
        }}>
          {/* Front Side */}
          <div className="absolute inset-0 flex items-center justify-center p-6 rounded-lg bg-white border-2 border-gray-200" style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)'
          }}>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-800 break-words font-space">{card.front}</p>
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 flex items-center justify-center p-6 rounded-lg bg-gray-50 border-2 border-gray-200" style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}>
            <div className="text-center">
              <p className="text-lg text-gray-800 break-words font-space">{card.back}</p>
            </div>
          </div>
        </div>
      </div>
      
      <Button onClick={handleReadAloud} variant="outline" size="sm" className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white border-gray-300">
        {isReading ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </Button>
    </div>
  );
};
