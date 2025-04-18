import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, catchError, of } from 'rxjs';

// Services
import { AdminService } from '../services/admin.service'; // Use AdminService
import { UserStateService, User } from '../../../core/services/user-state.service';
import { NotificationService } from '../../../core/services/notification.service';

// NgZorro Modules
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';

// Define ApiResponse Interface
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
}

@Component({
  selector: 'app-admin-profile',
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
    <h2>Admin Profile</h2>
    <nz-spin [nzSpinning]="isLoading || isSubmitting">
      <form nz-form [formGroup]="profileForm" (ngSubmit)="submitForm()" *ngIf="profileForm">
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
      <div *ngIf="!profileForm && !isLoading">Failed to load profile data.</div>
    </nz-spin>
  `,
})
export class AdminProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  isLoading = true;
  isSubmitting = false;

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService); // Use AdminService
  private userStateService = inject(UserStateService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.currentUser = this.userStateService.getCurrentUserValue();
    if (!this.currentUser) {
      this.notificationService.showError("Admin user data not found.");
      this.isLoading = false;
      return;
    }
    this.loadProfileData(this.currentUser._id);
  }

  buildForm(data: any): void {
     this.profileForm = this.fb.group({
       name: [data?.name || '', [Validators.required]],
       email: [{ value: data?.email || '', disabled: true }, [Validators.required, Validators.email]],
       // Add other admin-specific form controls if needed
     });
  }

  loadProfileData(userId: string): void {
    this.isLoading = true;
    this.adminService.getAdminProfile(userId)
      .pipe(
          finalize(() => this.isLoading = false),
          catchError(err => {
             this.notificationService.showError(err.error?.message || 'Failed to load admin profile.');
             return of({ success: false, data: null });
          })
      )
      .subscribe((res: ApiResponse<any>) => { // Use the ApiResponse interface here
        if (res.success && res.data) {
          this.buildForm(res.data);
        } else if (!res.success) {
          this.notificationService.showError(res.message || 'Could not load profile data.');
        }
      });
  }

  submitForm(): void {
    if (this.profileForm.invalid) {
      this.markFormDirty(this.profileForm);
      return;
    }

    this.isSubmitting = true;
    const profileData = { ...this.profileForm.getRawValue() };
    // Add userId explicitly if interceptor doesn't handle it or backend needs it for this specific route
    profileData.userId = this.currentUser?._id;

    this.adminService.updateAdminProfile(profileData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res: ApiResponse<any>) => { // Use the ApiResponse interface here
          if (res.success) {
            this.notificationService.showSuccess(res.message || 'Profile updated successfully!');
            // Optionally update user state if name changes, etc.
            if (this.currentUser && this.currentUser._id === res.data?._id) {
                this.userStateService.setCurrentUser({ ...this.currentUser, name: res.data.name });
            }
          } else {
            this.notificationService.showError(res.message || 'Failed to update profile.');
          }
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'An error occurred.');
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
}
