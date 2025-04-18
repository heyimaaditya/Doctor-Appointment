import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service'; // Use StorageService to check token existence

export const authGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  if (storageService.getToken()) {
    return true; // Token exists, allow access
  } else {
    // No token, redirect to login page
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
