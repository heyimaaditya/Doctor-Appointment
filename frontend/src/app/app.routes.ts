import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { publicGuard } from './core/guards/public.guard'; // Import public guard

// Layout Component
import { DefaultLayoutComponent } from './layouts/default-layout/default-layout.component';

// Public Components (example)
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
// import { LandingPageComponent } from './features/public/landing-page/landing-page.component';

export const routes: Routes = [
  // Public routes (Login, Register) - Use PublicGuard
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard] // Prevent logged-in users access
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [publicGuard] // Prevent logged-in users access
  },

  // Authenticated routes within the default layout
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [authGuard], // Ensure user is logged in for this layout
    children: [
      // Redirect base path inside layout based on role (example)
      {
         path: '',
         pathMatch: 'full',
         redirectTo: 'user' // Or dynamically redirect based on role check here or in a dedicated component
      },

      // Admin Routes
      {
        path: 'admin',
        canActivate: [roleGuard(['admin'])], // Only admins
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      },

      // Doctor Routes
      {
        path: 'doctor',
         canActivate: [roleGuard(['doctor'])], // Only doctors
        loadChildren: () => import('./features/doctor/doctor.module').then(m => m.DoctorModule)
      },

      // User Routes (can be accessed by admin/doctor too, or restrict further with roleGuard(['user']))
      {
        path: 'user',
        // Example: Allow any authenticated user, specific roles handled inside user.routes
        loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES)
      },

      // Common routes accessible by multiple roles if needed (e.g., Profile)
       {
         path: 'profile', // Example - handle specific profile component loading based on role inside layout or dedicated route file
         // component: ProfileComponent // Load a generic profile or route further
         // Consider moving profile routes into specific feature route files (admin/profile, doctor/profile, user/profile)
       },
       {
         path: 'notifications',
         // component: NotificationsComponent // Define NotificationsComponent
       }

      // ... other routes within the default layout
    ]
  },

  // Fallback route for unknown paths
  { path: '**', redirectTo: 'login' } // Or redirect to a 404 component
];

export const DOCTOR_ROUTES = [
  // doctor's routes here
];
