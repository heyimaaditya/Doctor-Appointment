import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { finalize, catchError, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router'; // Needed if viewing profiles by ID

// Services
import { DoctorService, DoctorProfileData } from '../services/doctor.service'; // Use DoctorService
import { UserStateService, User } from '../../../core/services/user-state.service';
import { NotificationService } from '../../../core/services/notification.service';

// NgZorro Modules
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker'; // For office hours

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule, // For Fee
    NzButtonModule,
    NzSpinModule,
    NzGridModule,
    NzTimePickerModule // For office hours
  ],
  template: `
    <h2>Doctor Profile</h2>
    <nz-spin [nzSpinning]="isLoading || isSubmitting">
      <form nz-form [formGroup]="profileForm" (ngSubmit)="submitForm()" *ngIf="profileForm">
        <h3>Personal Details</h3>
        <nz-row [nzGutter]="16">
          <nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label nzRequired nzFor="firstName">First Name</nz-form-label>
              <nz-form-control nzErrorTip="First name is required">
                <input nz-input formControlName="firstName" id="firstName" placeholder="First Name" />
              </nz-form-control>
            </nz-form-item>
          </nz-col>
          <nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label nzRequired nzFor="lastName">Last Name</nz-form-label>
              <nz-form-control nzErrorTip="Last name is required">
                <input nz-input formControlName="lastName" id="lastName" placeholder="Last Name" />
              </nz-form-control>
            </nz-form-item>
          </nz-col>
          <nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label nzRequired nzFor="email">Email</nz-form-label>
              <nz-form-control nzErrorTip="Valid email is required">
                <input nz-input formControlName="email" id="email" placeholder="Email Address" [readOnly]="true" />
              </nz-form-control>
            </nz-form-item>
          </nz-col>
          <nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label nzRequired nzFor="phone">Phone</nz-form-label>
              <nz-form-control nzErrorTip="Phone number is required">
                <input nz-input formControlName="phone" id="phone" placeholder="Phone Number" />
              </nz-form-control>
            </nz-form-item>
          </nz-col>
          <nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label nzFor="website">Website</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="website" id="website" placeholder="Website URL (optional)" />
              </nz-form-control>
            </nz-form-item>
          </nz-col>
          <nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label nzRequired nzFor="address">Address</nz-form-label>
              <nz-form-control nzErrorTip="Address is required">
                <input nz-input formControlName="address" id="address" placeholder="Clinic Address" />
              </nz-form-control>
            </nz-form-item>
          </nz-col>
        </nz-row>

        <h3>Professional Details</h3>
        <nz-row [nzGutter]="16">
           <nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label nzRequired nzFor="specialization">Specialization</nz-form-label>
              <nz-form-control nzErrorTip="Specialization is required">
                <input nz-input formControlName="specialization" id="specialization" placeholder="e.g., Cardiology" />
              </nz-form-control>
            </nz-form-item>
          </nz-col>
          <nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label nzRequired nzFor="experience">Experience</nz-form-label>
              <nz-form-control nzErrorTip="Experience is required">
                 <input nz-input formControlName="experience" id="experience" placeholder="e.g., 10 Years" />
              </nz-form-control>
            </nz-form-item>
          </nz-col>
          <nz-col [nzSpan]="8">
            <nz-form-item>
              <nz-form-label nzRequired nzFor="consultationFee">Consultation Fee</nz-form-label>
              <nz-form-control nzErrorTip="Fee is required">
                 <nz-input-number formControlName="consultationFee" id="consultationFee" [nzMin]="0" [nzStep]="50" nzPlaceHolder="Fee per visit" style="width: 100%;"></nz-input-number>
              </nz-form-control>
            </nz-form-item>
          </nz-col>
        </nz-row>

        <h3>Office Hours</h3>
        <nz-row [nzGutter]="16">
           <nz-col [nzSpan]="12">
               <nz-form-item>
                  <nz-form-label nzRequired nzFor="officeTimeStart">Start Time</nz-form-label>
                  <nz-form-control nzErrorTip="Start time is required">
                     <nz-time-picker formControlName="officeTimeStart" id="officeTimeStart" nzFormat="HH:mm" style="width: 100%;"></nz-time-picker>
                  </nz-form-control>
               </nz-form-item>
           </nz-col>
           <nz-col [nzSpan]="12">
               <nz-form-item>
                  <nz-form-label nzRequired nzFor="officeTimeEnd">End Time</nz-form-label>
                  <nz-form-control nzErrorTip="End time is required">
                     <nz-time-picker formControlName="officeTimeEnd" id="officeTimeEnd" nzFormat="HH:mm" style="width: 100%;"></nz-time-picker>
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
export class DoctorProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  isLoading = true;
  isSubmitting = false;
  doctorId: string | null = null; // Could be from route or user state

  private fb = inject(FormBuilder);
  private doctorService = inject(DoctorService);
  private userStateService = inject(UserStateService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute); // Inject ActivatedRoute

  ngOnInit(): void {
    // Determine if viewing own profile or someone else's based on route (if applicable)
    this.doctorId = this.route.snapshot.paramMap.get('id'); // Assuming route is /doctor/profile/:id
    this.currentUser = this.userStateService.getCurrentUserValue();

    if (this.doctorId && this.currentUser?._id === this.doctorId) {
        // Viewing own profile - can potentially use state or fetch fresh
        this.loadProfileData();
    } else {
        // Viewing someone else's profile (if allowed) or invalid route
        // Or simply fetching own profile without relying on route param matching ID
        this.loadProfileData(); // Assume fetching logged-in doctor's profile
    }
  }

  buildForm(data: DoctorProfileData | null): void {
      // Handle potential array format for officeTime from backend
      let startTime = null;
      let endTime = null;
      if (Array.isArray(data?.officeTime) && data?.officeTime.length === 2) {
         startTime = this.parseTimeString(data.officeTime[0]);
         endTime = this.parseTimeString(data.officeTime[1]);
      } else if (typeof data?.officeTime === 'object' && data.officeTime.start && data.officeTime.end) {
         startTime = this.parseTimeString(data.officeTime.start);
         endTime = this.parseTimeString(data.officeTime.end);
      }

     this.profileForm = this.fb.group({
       firstName: [data?.firstName || '', [Validators.required]],
       lastName: [data?.lastName || '', [Validators.required]],
       email: [{ value: data?.email || this.currentUser?.email || '', disabled: true }, [Validators.required, Validators.email]], // Email likely non-editable
       phone: [data?.phone || '', [Validators.required]],
       website: [data?.website || ''],
       address: [data?.address || '', [Validators.required]],
       specialization: [data?.specialization || '', [Validators.required]],
       experience: [data?.experience || '', [Validators.required]],
       consultationFee: [data?.consultationFee || 0, [Validators.required, Validators.min(0)]],
       officeTimeStart: [startTime, [Validators.required]],
       officeTimeEnd: [endTime, [Validators.required]]
     });
  }

  // Helper to parse HH:mm string to Date object for time picker
  private parseTimeString(timeString: string | null): Date | null {
      if (!timeString || !/^\d{2}:\d{2}$/.test(timeString)) return null;
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
   }

  // Helper to format Date object from time picker back to HH:mm string
   private formatTime(date: Date | null): string | null {
       if (!date) return null;
       const hours = date.getHours().toString().padStart(2, '0');
       const minutes = date.getMinutes().toString().padStart(2, '0');
       return `${hours}:${minutes}`;
   }

  loadProfileData(): void {
    this.isLoading = true;
    this.doctorService.getDoctorProfile() // Fetches logged-in doctor's profile
      .pipe(
          finalize(() => this.isLoading = false),
          catchError(err => {
             this.notificationService.showError(err.error?.message || 'Failed to load doctor profile.');
             return of({ success: false, data: null });
          })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.buildForm(res.data);
        } else if (!res.success) {
          this.notificationService.showError(res.message || 'Could not load profile data.');
          this.buildForm(null); // Build an empty form if load fails
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

    // Format officeTime back to the expected backend format (e.g., ["HH:mm", "HH:mm"])
    const startTime = this.formatTime(profileData.officeTimeStart);
    const endTime = this.formatTime(profileData.officeTimeEnd);
    if (startTime && endTime) {
       profileData.officeTime = [startTime, endTime];
    } else {
       // Handle error or default - shouldn't happen if fields are required
       this.notificationService.showError("Invalid office hours format.");
       this.isSubmitting = false;
       return;
    }
    delete profileData.officeTimeStart; // Remove temporary form controls
    delete profileData.officeTimeEnd;

    // Add userId if needed (check backend/interceptor)
    // profileData.userId = this.currentUser?._id;

    this.doctorService.updateDoctorProfile(profileData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.notificationService.showSuccess(res.message || 'Profile updated successfully!');
            // Optionally update user state if needed (e.g., doctor details for display elsewhere)
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