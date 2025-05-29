
import { User } from '../../types/flashcard';

export const saveUserToStorage = (user: User): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const removeUserFromStorage = (): void => {
  localStorage.removeItem('currentUser');
};

export const loadUserFromStorage = (): User | null => {
  try {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error('Error loading user from storage:', error);
    return null;
  }
};

export const updateUserInStorage = (updates: Partial<User>): void => {
  const savedUser = loadUserFromStorage();
  if (savedUser) {
    const updatedUser = { ...savedUser, ...updates };
    saveUserToStorage(updatedUser);
  }
};
