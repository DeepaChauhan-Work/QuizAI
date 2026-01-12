export interface QuizItem {
  quizId: string | number;
  name: string;
  summary: string;
  topic: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  questionList: QuizQuestion[];
  durationMinutes?: number;
  thumbnailUrl?: string;
  createdBy?: string;
  createdByUsername?: string;
  createdAt?: string;
}

export interface QuizQuestion {
  questionId: number;
  prompt: string;
  choices: string[];
  answerIndex: number;
  reasoning?: string;
}
