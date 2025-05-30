
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { LogOut, Crown } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Header logout button clicked');
    logout();
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-indigo-600 font-space">FlashMaster</h1>
          {user?.isPremium && (
            <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium font-space">
              <Crown size={12} />
              Premium
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};
