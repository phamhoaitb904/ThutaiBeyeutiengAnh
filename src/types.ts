export type GameState = 'setup' | 'playing' | 'result' | 'admin';

export interface Question {
  id: number;
  level: number;
  type: 'mcq' | 'tf';
  image: string;
  text: string;
  options: string[];
  answer: number;
  points: number;
}

export interface GameConfig {
  timePerQuestion: number;
  difficulty: string;
  useCamera: boolean;
}

export interface FeedbackState {
  isCorrect: boolean;
  message: string;
}
