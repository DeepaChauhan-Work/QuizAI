import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-login-modal.component.html',
  styleUrls: ['./student-login-modal.component.css']
})
export class StudentLoginModalComponent {
  @Output() close = new EventEmitter<void>();
  
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const username = this.loginForm.value.username;
      // Login as student
      await this.authService.loginWithUsername(username, 'student');
      
      // Get the redirect URL from localStorage
      const redirectUrl = localStorage.getItem('redirectUrl');
      localStorage.removeItem('redirectUrl');
      
      this.close.emit();
      
      // Navigate to redirect URL or default to home
      if (redirectUrl) {
        this.router.navigateByUrl(redirectUrl);
      } else {
        this.router.navigate(['/']);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Login failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
