import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStateService } from '../services/user-state.service';
import { map, take } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

export function roleGuard(allowedRoles: ('admin' | 'doctor' | 'user')[]): CanActivateFn {
  return (route, state) => {
    const userStateService = inject(UserStateService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);

    return userStateService.currentUser$.pipe(
      take(1), // Take the first emitted value (current user or null)
      map(user => {
        if (!user) {
           console.error("RoleGuard: User not logged in.");
           router.navigate(['/login']); // Should be caught by authGuard first, but safety check
           return false;
        }

        const hasRole = allowedRoles.some(role => {
          if (role === 'admin') return user.isAdmin;
          if (role === 'doctor') return user.isDoctor;
          if (role === 'user') return !user.isAdmin && !user.isDoctor; // Or adjust logic if needed
          return false;
        });

        if (hasRole) {
          return true;
        } else {
          console.warn(`RoleGuard: Access denied. User role (${user.isAdmin ? 'Admin' : ''}${user.isDoctor ? 'Doctor' : ''}) not in allowed roles (${allowedRoles.join(', ')}).`);
          notificationService.showError('Access Denied: You do not have permission to view this page.');
          // Redirect to a default page based on role or a general 'access-denied' page
          if (user.isAdmin) router.navigate(['/admin']);
          else if (user.isDoctor) router.navigate(['/doctor']);
          else router.navigate(['/user']); // Or just '/'
          return false;
        }
      })
    );
  };
}
