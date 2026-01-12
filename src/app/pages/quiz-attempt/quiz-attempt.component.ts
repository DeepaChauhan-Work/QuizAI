import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { QuizResultService } from '../../services/quiz-result.service';
import { AuthService } from '../../services/auth.service';
import { QuizItem, QuizQuestion } from '../../models/quiz.model';
import { QuizResult, QuizAnswer } from '../../models/quiz-result.model';

@Component({
  selector: 'app-quiz-attempt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-attempt.component.html',
  styleUrls: ['./quiz-attempt.component.css']
})
export class QuizAttemptComponent implements OnInit {
  quizData: QuizItem | undefined;
  currentQuestionIndex = 0;
  selectedAnswers: Map<number, number> = new Map();
  isSubmitted = false;
  score = 0;
  timeRemaining = 0;
  timerInterval: any;
  startTime: Date = new Date();
  isSavingResult = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private quizResultService: QuizResultService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.quizData = await this.quizService.findQuizById(id);
      
      if (!this.quizData) {
        this.router.navigate(['/quizzes']);
        return;
      }

      if (this.quizData.durationMinutes) {
        this.timeRemaining = this.quizData.durationMinutes * 60;
        this.startTimer();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.submitQuiz();
      }
    }, 1000);
  }

  get currentQuestion(): QuizQuestion | undefined {
    return this.quizData?.questionList[this.currentQuestionIndex];
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get progressPercentage(): number {
    if (!this.quizData) return 0;
    return ((this.currentQuestionIndex + 1) / this.quizData.questionList.length) * 100;
  }

  selectAnswer(choiceIndex: number): void {
    if (!this.isSubmitted && this.currentQuestion) {
      this.selectedAnswers.set(this.currentQuestion.questionId, choiceIndex);
    }
  }

  isAnswerSelected(choiceIndex: number): boolean {
    if (!this.currentQuestion) return false;
    return this.selectedAnswers.get(this.currentQuestion.questionId) === choiceIndex;
  }

  isCorrectAnswer(choiceIndex: number): boolean {
    if (!this.currentQuestion) return false;
    return choiceIndex === this.currentQuestion.answerIndex;
  }

  isWrongAnswer(choiceIndex: number): boolean {
    if (!this.currentQuestion) return false;
    const selectedAnswer = this.selectedAnswers.get(this.currentQuestion.questionId);
    return this.isSubmitted && 
           selectedAnswer === choiceIndex && 
           choiceIndex !== this.currentQuestion.answerIndex;
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  nextQuestion(): void {
    if (this.quizData && this.currentQuestionIndex < this.quizData.questionList.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  canSubmit(): boolean {
    return this.quizData?.questionList.length === this.selectedAnswers.size;
  }

  async submitQuiz(): Promise<void> {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.isSubmitted = true;
    this.calculateScore();

    // Save result if user is a student
    if (this.authService.isStudent() && this.quizData) {
      await this.saveResult();
    }
  }

  async saveResult(): Promise<void> {
    if (!this.quizData) return;

    try {
      this.isSavingResult = true;
      
      const endTime = new Date();
      const timeTaken = Math.round((endTime.getTime() - this.startTime.getTime()) / 1000 / 60); // in minutes

      const answers: QuizAnswer[] = [];
      this.quizData.questionList.forEach(question => {
        const selectedAnswer = this.selectedAnswers.get(question.questionId);
        if (selectedAnswer !== undefined) {
          answers.push({
            questionId: question.questionId,
            selectedAnswer: selectedAnswer,
            isCorrect: selectedAnswer === question.answerIndex
          });
        }
      });

      const result: QuizResult = {
        quizId: this.quizData.quizId,
        quizName: this.quizData.name,
        studentId: this.authService.getUserId() || '',
        studentName: this.authService.getUsername() || '',
        score: this.score / 10, // Convert to number of correct answers
        totalQuestions: this.quizData.questionList.length,
        percentage: this.scorePercentage,
        completedAt: new Date(),
        timeTaken: timeTaken,
        answers: answers
      };

      await this.quizResultService.saveQuizResult(result);
    } catch (error) {
      console.error('Error saving quiz result:', error);
    } finally {
      this.isSavingResult = false;
    }
  }

  calculateScore(): void {
    this.score = 0;
    if (!this.quizData) return;

    this.quizData.questionList.forEach(question => {
      const selectedAnswer = this.selectedAnswers.get(question.questionId);
      if (selectedAnswer === question.answerIndex) {
        this.score += 10;
      }
    });
  }

  get scorePercentage(): number {
    if (!this.quizData) return 0;
    const maxScore = this.quizData.questionList.length * 10;
    return (this.score / maxScore) * 100;
  }

  restartQuiz(): void {
    if (this.quizData) {
      this.router.navigate(['/quiz', this.quizData.quizId]);
    }
  }

  exitQuiz(): void {
    if (this.authService.isStudent()) {
      this.router.navigate(['/student/results']);
    } else {
      this.router.navigate(['/quizzes']);
    }
  }
}
