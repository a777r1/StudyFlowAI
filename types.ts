
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export type ViewType = 'chat' | 'flashcards' | 'timer' | 'planner';

export interface StudySession {
  id: string;
  subject: string;
  startTime: Date;
  durationMinutes: number;
}
