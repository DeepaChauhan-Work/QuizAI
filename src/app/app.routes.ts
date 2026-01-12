import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { HomeComponent } from './pages/home/home.component';
import { QuizzesComponent } from './pages/quizzes/quizzes.component';
import { ContactComponent } from './pages/contact/contact.component';
import { QuizDetailsComponent } from './pages/quiz-details/quiz-details.component';
import { QuizAttemptComponent } from './pages/quiz-attempt/quiz-attempt.component';
import { StudentResultsComponent } from './pages/student-results/student-results.component';
import { QuizAnalyticsComponent } from './pages/quiz-analytics/quiz-analytics.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] },
    { path: 'quizzes', component: QuizzesComponent, canActivate: [authGuard] },
    { path: 'analytics', component: QuizAnalyticsComponent, canActivate: [authGuard] },
    { path: 'quiz/:id', component: QuizDetailsComponent },
    { path: 'quiz/:id/attempt', component: QuizAttemptComponent, canActivate: [authGuard] },
    { path: 'student/results', component: StudentResultsComponent, canActivate: [authGuard] },
    { path: 'contact', component: ContactComponent },
];