import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to initialize
  await authService.waitForAuth();

  if (!authService.isAuthenticated) {
    // Store the attempted URL for redirecting after login
    localStorage.setItem('redirectUrl', state.url);
    
    // Redirect to landing page with login prompt
    router.navigate(['/'], { queryParams: { login: 'required' } });
    return false;
  }

  // Block students from accessing admin pages
  if (authService.isStudent()) {
    const adminOnlyRoutes = ['/home', '/quizzes', '/analytics', '/contact'];
    if (adminOnlyRoutes.some(route => state.url.startsWith(route))) {
      router.navigate(['/']);
      return false;
    }
  }

  return true;
};
