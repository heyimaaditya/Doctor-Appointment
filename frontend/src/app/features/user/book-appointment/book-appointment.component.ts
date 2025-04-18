import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { finalize, catchError, switchMap, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { format } from 'date-fns'; // Use date-fns for reliable formatting

// Services
import { DoctorService, DoctorProfileData } from '../../doctor/services/doctor.service';
import { UserService } from '../services/user.service';
import { UserStateService, User } from '../../../core/services/user-state.service';
import { NotificationService } from '../../../core/services/notification.service';

// NgZorro Modules
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions'; // For displaying doctor info

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NzFormModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzButtonModule,
    NzSpinModule,
    NzGridModule,
    NzCardModule,
    NzAlertModule,
    NzDescriptionsModule,
    DatePipe
  ],
  providers: [DatePipe],
})
export class BookAppointmentComponent implements OnInit, OnDestroy {
  bookingForm!: FormGroup;
  doctor: DoctorProfileData | null = null;
  currentUser: User | null = null;
  isLoadingDoctor = true;
  isCheckingAvailability = false;
  isAvailable: boolean | null = null;
  availabilityMessage: string | null = null;
  isSubmitting = false;
  doctorId: string | null = null;

  private destroy$ = new Subject<void>();

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private doctorService = inject(DoctorService);
  private userService = inject(UserService);
  private userStateService = inject(UserStateService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.currentUser = this.userStateService.getCurrentUserValue();
    this.doctorId = this.route.snapshot.paramMap.get('doctorId');

    if (!this.doctorId) {
      this.notificationService.showError('Doctor ID not found in route.');
      this.isLoadingDoctor = false;
      // Consider navigating back or showing an error message prominently
      return;
    }

    this.loadDoctorDetails(this.doctorId);
    this.buildForm();
    this.setupAvailabilityCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildForm(): void {
    this.bookingForm = this.fb.group({
      appointmentDate: [null, [Validators.required]],
      appointmentTime: [null, [Validators.required]],
    });
  }

  loadDoctorDetails(id: string): void {
    this.isLoadingDoctor = true;
    this.doctorService.getDoctorById(id)
      .pipe(
        finalize(() => this.isLoadingDoctor = false),
        catchError(err => {
          this.notificationService.showError(err.error?.message || 'Failed to load doctor details.');
          this.router.navigate(['/user/find-doctor']); // Navigate back if doctor not found
          return of({ success: false, data: null });
        })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.doctor = res.data;
        } else if (!res.success) {
          this.notificationService.showError(res.message || 'Could not load doctor details.');
          this.router.navigate(['/user/find-doctor']);
        }
      });
  }

  setupAvailabilityCheck(): void {
    this.bookingForm.valueChanges.pipe(
      debounceTime(500), // Wait for 500ms pause in typing/selection
      distinctUntilChanged((prev, curr) => prev.appointmentDate === curr.appointmentDate && prev.appointmentTime === curr.appointmentTime),
      takeUntil(this.destroy$) // Unsubscribe on component destroy
    ).subscribe(value => {
      if (value.appointmentDate && value.appointmentTime && this.doctorId) {
        this.checkAvailability(this.doctorId, value.appointmentDate, value.appointmentTime);
      } else {
         this.isAvailable = null; // Reset availability if date/time cleared
         this.availabilityMessage = null;
      }
    });
  }

  checkAvailability(doctorId: string, date: Date, time: Date): void {
     this.isCheckingAvailability = true;
     this.isAvailable = null;
     this.availabilityMessage = null;

     // Format date and time as expected by backend (e.g., YYYY-MM-DD, HH:mm)
     const formattedDate = format(date, 'yyyy-MM-dd'); // Use date-fns
     const formattedTime = format(time, 'HH:mm'); // Use date-fns

     this.userService.checkBookingAvailability({ doctorId, date: formattedDate, time: formattedTime })
        .pipe(finalize(() => this.isCheckingAvailability = false))
        .subscribe({
           next: (res) => {
              this.isAvailable = res.success;
              this.availabilityMessage = res.message; // Display message from backend
           },
           error: (err) => {
              this.isAvailable = false; // Assume not available on error
              this.availabilityMessage = err.error?.message || 'Error checking availability.';
              this.notificationService.showError(this.availabilityMessage);
           }
        });
  }

  submitBooking(): void {
    if (this.bookingForm.invalid || !this.isAvailable || !this.doctor || !this.currentUser || !this.doctorId) {
       this.notificationService.showError('Please select an available date and time.');
       this.markFormDirty(this.bookingForm);
       return;
    }

    this.isSubmitting = true;
    const formValue = this.bookingForm.value;

    // Format date/time for backend
    const formattedDate = format(formValue.appointmentDate, 'yyyy-MM-dd');
    const formattedTime = format(formValue.appointmentTime, 'HH:mm');

    // Prepare booking data structure matching backend schema/controller expectations
    const bookingData = {
       doctorId: this.doctorId,
       userId: this.currentUser._id, // Logged-in user ID
       doctorInfo: `Dr. ${this.doctor.firstName} ${this.doctor.lastName} - ${this.doctor.specialization}`, // Example string representation
       userInfo: `${this.currentUser.name} - ${this.currentUser.email}`, // Example string representation
       date: formattedDate,
       officeTime: formattedTime, // Backend `appointmentSchema` uses officeTime field for the booking time slot
       // status will default to 'pending' on backend
    };

    this.userService.bookAppointment(bookingData)
       .pipe(finalize(() => this.isSubmitting = false))
       .subscribe({
          next: (res) => {
             if (res.success) {
                this.notificationService.showSuccess(res.message || 'Appointment booked successfully!');
                this.router.navigate(['/user/appointments']); // Navigate to user's appointments page
             } else {
                this.notificationService.showError(res.message || 'Failed to book appointment.');
             }
          },
          error: (err) => {
             this.notificationService.showError(err.error?.message || 'An error occurred during booking.');
          }
       });
  }

   private markFormDirty(form: FormGroup): void {
     Object.values(form.controls).forEach(control => {
       if (control.invalid) {
         control.markAsDirty();
         control.updateValueAndValidity({ onlySelf: true });
       }
     });
   }

   // Disable past dates in the date picker
   disabledDate = (current: Date): boolean => {
      // Can not select days before today
      return current < new Date(new Date().setHours(0, 0, 0, 0));
   };

}
