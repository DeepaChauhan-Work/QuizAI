import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { QuizItem } from '../../models/quiz.model';
import { QuizService } from '../../services/quiz.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  highlightedQuizzes: QuizItem[] = [];
  quizForm!: FormGroup;
  isGenerating = false;
  selectedFileName: string = '';

  constructor(
    private quizService: QuizService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.initForm();
  }

  async ngOnInit(): Promise<void> {
    // Wait for auth to initialize before loading quizzes
    await this.authService.waitForAuth();
    const allQuizzes = await this.quizService.getAllQuizzes();
    this.highlightedQuizzes = allQuizzes.slice(0, 3);
  }

  private initForm(): void {
    this.quizForm = this.fb.group({
      quizName: ['', Validators.required],
      difficulty: ['', Validators.required],
      questionCount: [10, [Validators.required, Validators.min(1)]],

      inputMode: ['prompt'], // prompt | upload

      prompt: [''],
      document: [null]
    });

    this.handleInputModeChange();
  }

  get inputMode(): string {
    return this.quizForm.get('inputMode')?.value;
  }

  private handleInputModeChange(): void {
    this.quizForm.get('inputMode')?.valueChanges.subscribe(mode => {
      if (mode === 'prompt') {
        this.quizForm.get('prompt')?.setValidators(Validators.required);
        this.quizForm.get('document')?.clearValidators();
      } else {
        this.quizForm.get('document')?.setValidators(Validators.required);
        this.quizForm.get('prompt')?.clearValidators();
      }

      this.quizForm.get('prompt')?.updateValueAndValidity();
      this.quizForm.get('document')?.updateValueAndValidity();
    });
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.quizForm.patchValue({ document: file });
      this.selectedFileName = file.name;
    }
  }

  async generateQuiz(): Promise<void> {
 const payload = this.quizForm.value;
    if (payload.inputMode === 'prompt') {
     if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      alert("Please enter all required fields");
      return;
    }
    }
   

   
    this.isGenerating = true;

    try {
      const newQuiz = await this.quizService.generateAiQuiz(payload);
      console.log('Generated quiz:', newQuiz);
      
      // Navigate to the new quiz details page
      alert(`Quiz "${newQuiz.name}" generated successfully!`);
      this.router.navigate(['/quiz', newQuiz.quizId]);
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      this.isGenerating = false;
    }
  }
}
