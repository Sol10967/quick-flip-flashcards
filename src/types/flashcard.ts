
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  isPremium: boolean;
  cardsCreatedToday: number;
  lastCardCreationDate: string;
}
