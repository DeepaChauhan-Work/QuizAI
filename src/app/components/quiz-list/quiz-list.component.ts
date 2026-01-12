import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizItem } from '../../models/quiz.model';
import { QuizCardComponent } from '../quiz-card/quiz-card.component';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, QuizCardComponent],
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.css']
})
export class QuizListComponent {
  @Input() quizCollection: QuizItem[] = [];
}
