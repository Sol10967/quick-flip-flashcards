
import { ReactNode } from 'react';
import { User } from './flashcard';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  upgradeUser: () => void;
  checkSubscription: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
