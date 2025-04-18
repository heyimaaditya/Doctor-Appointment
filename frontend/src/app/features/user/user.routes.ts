import { Routes } from '@angular/router';
import { FindDoctorComponent } from './find-doctor/find-doctor.component';
import { BookAppointmentComponent } from './book-appointment/book-appointment.component';
import { UserAppointmentsComponent } from './appointments/appointments.component'; // Define UserAppointmentsComponent
import { ApplyDoctorComponent } from './apply-doctor/apply-doctor.component'; // Define ApplyDoctorComponent
import { UserProfileComponent } from './profile/profile.component'; // User profile component

export const USER_ROUTES: Routes = [
    { path: '', redirectTo: 'find-doctor', pathMatch: 'full' }, // Default user route
    { path: 'find-doctor', component: FindDoctorComponent },
    { path: 'book-appointment/:doctorId', component: BookAppointmentComponent }, // Route with parameter
    { path: 'appointments', component: UserAppointmentsComponent },
    { path: 'apply-doctor', component: ApplyDoctorComponent },
    { path: 'profile', component: UserProfileComponent },
    // Add other user-specific routes here (e.g., notifications page)
    // { path: 'notifications', component: NotificationsComponent },
];