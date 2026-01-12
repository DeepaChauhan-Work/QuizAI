import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { QuizResult } from '../../models/quiz-result.model';
import { QuizResultService } from '../../services/quiz-result.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-results.component.html',
  styleUrls: ['./student-results.component.css']
})
export class StudentResultsComponent implements OnInit {
  results: QuizResult[] = [];
  isLoading = true;
  selectedResult: QuizResult | null = null;

  constructor(
    private quizResultService: QuizResultService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    // Wait for auth to initialize
    await this.authService.waitForAuth();
    
    // Ensure only students can access
    if (!this.authService.isStudent()) {
      this.router.navigate(['/']);
      return;
    }

    await this.loadResults();
  }

  async loadResults(): Promise<void> {
    try {
      this.isLoading = true;
      const studentId = this.authService.getUserId();
      if (studentId) {
        this.results = await this.quizResultService.getStudentResults(studentId);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      this.isLoading = false;
    }
  }

  viewCertificate(result: QuizResult): void {
    this.selectedResult = result;
  }

  closeCertificate(): void {
    this.selectedResult = null;
  }

  downloadCertificate(result: QuizResult): void {
    // Trigger print dialog for certificate
    window.print();
  }

  getGradeLabel(percentage: number): string {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Very Good';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  }

  getGradeColor(percentage: number): string {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  }

  getBadgeColor(percentage: number): string {
    if (percentage >= 90) return 'bg-green-100 text-green-700';
    if (percentage >= 80) return 'bg-blue-100 text-blue-700';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-700';
    if (percentage >= 60) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  }
}
