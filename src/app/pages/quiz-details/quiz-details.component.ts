import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { AuthService } from '../../services/auth.service';
import { QuizItem } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-details.component.html',
  styleUrls: ['./quiz-details.component.css']
})
export class QuizDetailsComponent implements OnInit {
  quizData: QuizItem | undefined;
  rulesVisible = false;
  isStudent = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      // Check if user is authenticated
      if (!this.authService.isAuthenticated) {
        // Store the quiz URL for redirect after login
        localStorage.setItem('redirectUrl', `/quiz/${id}/attempt`);
        // Redirect to landing page with student login
        this.router.navigate(['/'], { queryParams: { login: 'required' } });
        return;
      }

      // User is authenticated - check role
      this.isStudent = this.authService.isStudent();

      this.quizData = await this.quizService.findQuizById(id);
      
      if (!this.quizData) {
        this.router.navigate(['/']);
        return;
      }

      // If student, redirect directly to attempt page
      if (this.isStudent) {
        this.router.navigate(['/quiz', this.quizData.quizId, 'attempt']);
      }
    }
  }

  displayRules(): void {
    this.rulesVisible = !this.rulesVisible;
  }

  beginQuizAttempt(): void {
    if (this.quizData) {
      this.router.navigate(['/quiz', this.quizData.quizId, 'attempt']);
    }
  }

}
