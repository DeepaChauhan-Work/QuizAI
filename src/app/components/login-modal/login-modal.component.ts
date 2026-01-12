import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  usernameStatus: 'checking' | 'available' | 'existing' | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]]
    });

    // Check username availability on input with debouncing
    this.loginForm.get('username')?.valueChanges.subscribe(async (value) => {
      if (value && value.length >= 3) {
        this.usernameStatus = 'checking';
        const isAvailable = await this.authService.isUsernameAvailable(value);
        this.usernameStatus = isAvailable ? 'available' : 'existing';
      } else {
        this.usernameStatus = null;
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const username = this.loginForm.get('username')?.value.trim();
      await this.authService.loginWithUsername(username);
      this.loginSuccess.emit();
      this.close();
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to login. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  close(): void {
    this.closeModal.emit();
  }

  get username() {
    return this.loginForm.get('username');
  }
}
