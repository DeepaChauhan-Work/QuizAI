export interface QuizResult {
  resultId?: string;
  quizId: string | number;
  quizName: string;
  studentId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: Date | string;
  timeTaken?: number; // in minutes
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
}
