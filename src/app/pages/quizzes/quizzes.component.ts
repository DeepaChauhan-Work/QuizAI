import { Component, OnInit } from '@angular/core';
import { QuizItem } from '../../models/quiz.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QuizService } from '../../services/quiz.service';
import { AuthService } from '../../services/auth.service';
import { QuizListComponent } from '../../components/quiz-list/quiz-list.component';

@Component({
  selector: 'app-quizzes',
  standalone: true,
  imports: [ReactiveFormsModule, QuizListComponent],
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.css']
})
export class QuizzesComponent implements OnInit {
  availableQuizzes: QuizItem[] = [];
  searchForm: FormGroup;

  constructor(
    private quizService: QuizService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      topic: [''],
      level: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    // Wait for auth to initialize before loading quizzes
    await this.authService.waitForAuth();
    this.availableQuizzes = await this.quizService.getAllQuizzes();
  }

  async applyFilters(): Promise<void> {
    const { topic, level } = this.searchForm.value;
    this.availableQuizzes = await this.quizService.searchQuizzes(topic, level);
  }
}
