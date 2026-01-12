import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QuizItem } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-card.component.html',
  styleUrls: ['./quiz-card.component.css']
})
export class QuizCardComponent {
  @Input() quizData!: QuizItem;
  linkCopied = false;

  async shareQuiz(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (!this.quizData) return;

    const quizUrl = `${window.location.origin}/quiz/${this.quizData.quizId}`;

    try {
      // Try native share API first (mobile/modern browsers)
      if (navigator.share) {
        await navigator.share({
          title: this.quizData.name,
          text: `Check out this quiz: ${this.quizData.name}`,
          url: quizUrl
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(quizUrl);
        this.linkCopied = true;
        setTimeout(() => {
          this.linkCopied = false;
        }, 2500);
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  }
}
