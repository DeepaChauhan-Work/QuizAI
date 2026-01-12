import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { AuthService } from '../../services/auth.service';
import { LoginModalComponent } from '../../components/login-modal/login-modal.component';
import { StudentLoginModalComponent } from '../../components/student-login-modal/student-login-modal.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginModalComponent, StudentLoginModalComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  totalQuizzes = 0;
  activeQuizzes = 0;
  averageRating = 4.8;
  totalUsers = 1250;
  showLoginModal = false;
  showStudentLoginModal = false;

  features = [
    {
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      title: 'AI-Powered Generation',
      description: 'Create intelligent quizzes instantly using advanced AI technology from text or documents.'
    },
    {
      icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
      title: 'Multiple Difficulty Levels',
      description: 'Choose from Beginner, Intermediate, and Advanced levels to match your learning goals.'
    },
    {
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      title: 'Document Upload',
      description: 'Upload PDFs, DOCX, TXT, or Excel files to generate customized quizzes from your content.'
    },
    {
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      title: 'Real-time Analytics',
      description: 'Track your progress with detailed score breakdowns and performance insights.'
    },
    {
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Timed Assessments',
      description: 'Challenge yourself with time-limited quizzes to improve speed and accuracy.'
    },
    {
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Instant Feedback',
      description: 'Get immediate results with detailed explanations for each answer.'
    }
  ];

  constructor(
    private quizService: QuizService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    const allQuizzes = await this.quizService.getAllQuizzes();
    this.totalQuizzes = allQuizzes.length;
    this.activeQuizzes = allQuizzes.filter(q => q.questionList.length > 0).length;

    // Check if redirected from auth guard (quiz sharing)
    this.route.queryParams.subscribe(params => {
      if (params['login'] === 'required') {
        // Check if user is trying to access a quiz (student login)
        const redirectUrl = localStorage.getItem('redirectUrl');
        if (redirectUrl && redirectUrl.includes('/quiz/')) {
          this.showStudentLoginModal = true;
        } else {
          // Admin login for creating quizzes
          this.showLoginModal = true;
        }
      }
    });
  }

  handleCreateQuiz(): void {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/home']);
    } else {
      this.showLoginModal = true;
    }
  }

  onLoginSuccess(): void {
    this.showLoginModal = false;
    // Redirect to the original URL if stored
    const redirectUrl = localStorage.getItem('redirectUrl') || '/home';
    localStorage.removeItem('redirectUrl');
    this.router.navigate([redirectUrl]);
  }

  onLoginCancel(): void {
    this.showLoginModal = false;
  }

  onStudentLoginCancel(): void {
    this.showStudentLoginModal = false;
    localStorage.removeItem('redirectUrl');
  }
}
