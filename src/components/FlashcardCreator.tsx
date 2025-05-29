
import { useState } from 'react';
import { Flashcard } from '../types/flashcard';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface FlashcardCreatorProps {
  onCreateCard: (front: string, back: string) => boolean;
  canCreateCard: boolean;
  cardsCreatedToday: number;
}

export const FlashcardCreator = ({ onCreateCard, canCreateCard, cardsCreatedToday }: FlashcardCreatorProps) => {
  const { user } = useAuth();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (front.trim() && back.trim() && canCreateCard) {
      const success = onCreateCard(front.trim(), back.trim());
      if (success) {
        setFront('');
        setBack('');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: 'front' | 'back') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (field === 'front' && front.trim()) {
        // Focus back field
        const backTextarea = document.querySelector('[data-field="back"]') as HTMLTextAreaElement;
        backTextarea?.focus();
      } else if (field === 'back' && back.trim() && canCreateCard) {
        handleSubmit(e);
      }
    }
  };

  const displayLimit = user?.isPremium ? '∞' : '5';
  const frontLimit = user?.isPremium ? '∞' : '20';
  const backLimit = user?.isPremium ? '∞' : '50';

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 font-space">Create Your Flashcard</h2>
              <p className="text-gray-600 font-space">Cards created today: {cardsCreatedToday}/{displayLimit}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-space">
                  Front (Question/Topic) - {front.length}/{frontLimit} characters
                </label>
                <Textarea 
                  value={front} 
                  onChange={e => setFront(e.target.value)} 
                  onKeyPress={e => handleKeyPress(e, 'front')} 
                  placeholder="Enter your question or topic..." 
                  className="min-h-[80px] resize-none border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 font-space" 
                  maxLength={user?.isPremium ? undefined : 20} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-space">
                  Back (Answer/Information) - {back.length}/{backLimit} characters
                </label>
                <Textarea 
                  data-field="back" 
                  value={back} 
                  onChange={e => setBack(e.target.value)} 
                  onKeyPress={e => handleKeyPress(e, 'back')} 
                  placeholder="Enter your answer or information..." 
                  className="min-h-[80px] resize-none border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 font-space" 
                  maxLength={user?.isPremium ? undefined : 50} 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={!front.trim() || !back.trim() || !canCreateCard} 
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-space"
            >
              <PlusCircle size={20} />
              {canCreateCard ? 'Create Flashcard' : 'Daily Limit Reached'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
