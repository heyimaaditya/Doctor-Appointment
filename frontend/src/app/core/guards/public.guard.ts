import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { UserStateService } from '../services/user-state.service'; // To redirect based on role

export const publicGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const userStateService = inject(UserStateService);
  const router = inject(Router);

  if (storageService.getToken()) {
    // User is logged in, redirect them away from public-only pages
    const user = userStateService.getCurrentUserValue();
    if (user?.isAdmin) {
      router.navigate(['/admin']); // Redirect admin to admin dashboard
    } else if (user?.isDoctor) {
      router.navigate(['/doctor']); // Redirect doctor to doctor dashboard
    } else {
      router.navigate(['/user']); // Redirect regular user to user dashboard or '/'
    }
    return false; // Prevent access to the public route
  } else {
    // User is not logged in, allow access to the public route
    return true;
  }
};