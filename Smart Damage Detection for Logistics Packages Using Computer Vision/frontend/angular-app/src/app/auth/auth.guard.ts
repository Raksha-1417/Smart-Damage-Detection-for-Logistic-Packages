/**
 * Auth Guard - Protect routes
 * Author: RakshaRajkumar14
 * Date: 2025-11-16 14:37:47 UTC
 */

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirect to login
  router.navigate(['/login']);
  return false;
};