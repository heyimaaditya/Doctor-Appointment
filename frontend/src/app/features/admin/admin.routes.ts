import { Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { DoctorsComponent } from './doctors/doctors.component';
import { AdminProfileComponent } from './profile/profile.component'; // Assuming you create this component

export const ADMIN_ROUTES: Routes = [
    { path: '', redirectTo: 'users', pathMatch: 'full' }, // Default admin route
    { path: 'users', component: UsersComponent },
    { path: 'doctors', component: DoctorsComponent },
    { path: 'profile', component: AdminProfileComponent }, // Define AdminProfileComponent similar to UserProfileComponent
    // Add other admin-specific routes here
];