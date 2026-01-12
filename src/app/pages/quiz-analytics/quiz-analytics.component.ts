import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { QuizResultService } from '../../services/quiz-result.service';
import { AuthService } from '../../services/auth.service';
import { QuizItem } from '../../models/quiz.model';
import { QuizResult } from '../../models/quiz-result.model';

interface QuizAnalytics {
  quiz: QuizItem;
  attemptCount: number;
  uniqueStudentCount: number;
  results: QuizResult[];
  averageScore: number;
  expanded: boolean;
}

@Component({
  selector: 'app-quiz-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-analytics.component.html',
  styleUrls: ['./quiz-analytics.component.css']
})
export class QuizAnalyticsComponent implements OnInit {
  quizAnalytics: QuizAnalytics[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private quizService: QuizService,
    private quizResultService: QuizResultService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    // Wait for auth to initialize before loading data
    await this.authService.waitForAuth();
    await this.loadAnalytics();
  }

  async loadAnalytics(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      const quizzes = await this.quizService.getAllQuizzes();
      console.log('Loaded quizzes:', quizzes.length);
      
      if (quizzes.length === 0) {
        this.isLoading = false;
        return;
      }
      
      this.quizAnalytics = await Promise.all(
        quizzes.map(async (quiz) => {
          try {
            const results = await this.quizResultService.getQuizResults(quiz.quizId);
            const uniqueStudents = new Set(results.map(r => r.studentId));
            const averageScore = results.length > 0
              ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
              : 0;

            return {
              quiz,
              attemptCount: results.length,
              uniqueStudentCount: uniqueStudents.size,
              results,
              averageScore,
              expanded: false
            };
          } catch (err) {
            console.error(`Error loading results for quiz ${quiz.quizId}:`, err);
            return {
              quiz,
              attemptCount: 0,
              uniqueStudentCount: 0,
              results: [],
              averageScore: 0,
              expanded: false
            };
          }
        })
      );

      this.quizAnalytics.sort((a, b) => b.attemptCount - a.attemptCount);
    } catch (error) {
      console.error('Error loading quiz analytics:', error);
      this.errorMessage = 'Failed to load analytics. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  toggleExpanded(analytics: QuizAnalytics): void {
    analytics.expanded = !analytics.expanded;
  }

  getPassRate(results: QuizResult[]): number {
    if (results.length === 0) return 0;
    const passed = results.filter(r => r.percentage >= 60).length;
    return (passed / results.length) * 100;
  }
}
