import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, catchError, of } from 'rxjs';

// Services
import { UserService } from '../services/user.service';
import { UserStateService, User } from '../../../core/services/user-state.service';
import { NotificationService } from '../../../core/services/notification.service';

// NgZorro Modules
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid'; // For layout

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSpinModule,
    NzGridModule
  ],
  template: `
    <h2>My Profile</h2>
    <nz-spin [nzSpinning]="isLoading || isSubmitting">
      <form nz-form [formGroup]="profileForm" (ngSubmit)="submitForm()">
        <nz-row [nzGutter]="16">
          <nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired nzFor="name">Name</nz-form-label>
              <nz-form-control nzErrorTip="Please input your name!">
                <input nz-input formControlName="name" id="name" placeholder="Your full name" />
              </nz-form-control>
            </nz-form-item>
          </nz-col>
          <nz-col [nzSpan]="12">
            <nz-form-item>
              <nz-form-label nzRequired nzFor="email">Email</nz-form-label>
              <nz-form-control nzErrorTip="Please input a valid email!">
                 <input nz-input formControlName="email" id="email" placeholder="Your email address" [readOnly]="true"/>
              </nz-form-control>
            </nz-form-item>
          </nz-col>
           </nz-row>

         <nz-form-item>
          <nz-form-control>
            <button nz-button nzType="primary" [disabled]="profileForm.invalid || isSubmitting" [nzLoading]="isSubmitting">Update Profile</button>
          </nz-form-control>
        </nz-form-item>
      </form>
    </nz-spin>
  `,
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  isLoading = true; // Loading initial data
  isSubmitting = false; // Submitting update

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private userStateService = inject(UserStateService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
     this.currentUser = this.userStateService.getCurrentUserValue();
     if (!this.currentUser) {
        // This shouldn't happen if authGuard works, but handle defensively
        this.notificationService.showError("User data not found. Please log in again.");
        this.isLoading = false;
        // Optional: redirect to login
        return;
     }

     this.profileForm = this.fb.group({
       name: [this.currentUser.name || '', [Validators.required]],
       email: [{ value: this.currentUser.email || '', disabled: true }, [Validators.required, Validators.email]], // Email usually not editable
       // Add other fields here, e.g.:
       // phone: [this.currentUser.phone || ''],
       // newPassword: [''],
       // confirmPassword: ['']
     }/*, { validators: this.passwordMatchValidatorIfProvided }*/); // Add password validator if implementing update password

     this.isLoading = false; // Data loaded from state service
     // Alternatively, fetch fresh data from backend if needed:
     // this.loadProfileData(this.currentUser._id);
  }

  /* // Optional: Validator for password confirmation only if new password is entered
  passwordMatchValidatorIfProvided(form: FormGroup) {
     const newPassword = form.get('newPassword')?.value;
     const confirmPassword = form.get('confirmPassword')?.value;
     if (newPassword || confirmPassword) { // Only validate if either field has value
       return newPassword === confirmPassword ? null : { passwordMismatch: true };
     }
     return null; // No validation needed if password fields are empty
  }
  */

  // Optional: Method to fetch fresh data
  // loadProfileData(userId: string): void {
  //   this.isLoading = true;
  //   this.userService.getUserProfile(userId)
  //     .pipe(finalize(() => this.isLoading = false))
  //     .subscribe(res => {
  //       if (res.success) {
  //         this.profileForm.patchValue(res.data);
  //         // Ensure email remains disabled if fetched
  //         this.profileForm.get('email')?.disable();
  //       } else {
  //         this.notificationService.showError(res.message || 'Failed to load profile data.');
  //       }
  //     });
  // }

  submitForm(): void {
    if (this.profileForm.invalid) {
       Object.values(this.profileForm.controls).forEach(control => {
         if (control.invalid) {
           control.markAsDirty();
           control.updateValueAndValidity({ onlySelf: true });
         }
       });
       return;
    }

    this.isSubmitting = true;
    const profileData = { ...this.profileForm.getRawValue() }; // Use getRawValue to include disabled email
    // Add userId if backend requires it and interceptor doesn't handle it
    // profileData.userId = this.currentUser?._id;

    // Handle password update logic if implementing
    // if (!profileData.newPassword) {
    //    delete profileData.newPassword; // Don't send empty password fields
    //    delete profileData.confirmPassword;
    // } else {
    //    profileData.password = profileData.newPassword; // Send new password under 'password' field if backend expects that
    //    delete profileData.newPassword;
    //    delete profileData.confirmPassword;
    // }


    this.userService.updateUserProfile(profileData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.notificationService.showSuccess(res.message || 'Profile updated successfully!');
            // Optionally update local user state if needed
            // this.userStateService.setCurrentUser({ ...this.currentUser, ...res.data }); // Update with returned data
          } else {
            this.notificationService.showError(res.message || 'Failed to update profile.');
          }
        },
        error: (err) => {
           this.notificationService.showError(err.error?.message || 'An error occurred.');
        }
      });
  }
}
