import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

// Services
import { UserService } from '../services/user.service';
import { UserStateService } from '../../../core/services/user-state.service';
import { NotificationService } from '../../../core/services/notification.service';

// NgZorro Modules
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzAlertModule } from 'ng-zorro-antd/alert';

@Component({
  selector: 'app-apply-doctor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzButtonModule,
    NzSpinModule,
    NzGridModule,
    NzTimePickerModule,
    NzAlertModule
  ],
  template: `
    <h2>Apply to Become a Doctor</h2>
    <p>Fill out the details below to submit your application for review.</p>

    <nz-alert *ngIf="isAlreadyDoctor" nzType="info" nzMessage="You are already registered as a doctor." nzShowIcon class="info-alert"></nz-alert>
    <nz-alert *ngIf="hasPendingApplication" nzType="warning" nzMessage="You have a pending application under review." nzShowIcon class="info-alert"></nz-alert>

    <nz-spin [nzSpinning]="isSubmitting">
      <form nz-form [formGroup]="applyForm" (ngSubmit)="submitForm()" *ngIf="applyForm && !isAlreadyDoctor && !hasPendingApplication">
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
            <button nz-button nzType="primary" [disabled]="applyForm.invalid || isSubmitting" [nzLoading]="isSubmitting">Submit Application</button>
          </nz-form-control>
        </nz-form-item>
      </form>
    </nz-spin>
  `,
  styles: [`
     .info-alert { margin-bottom: 16px; }
  `]
})
export class ApplyDoctorComponent implements OnInit {
  applyForm!: FormGroup;
  isSubmitting = false;
  isAlreadyDoctor = false;
  hasPendingApplication = false; // Add logic to check this if backend provides status

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private userStateService = inject(UserStateService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit(): void {
    const currentUser = this.userStateService.getCurrentUserValue();
    this.isAlreadyDoctor = !!currentUser?.isDoctor;

    // TODO: Add logic here to check if the user has a PENDING application
    // This might require fetching the doctor profile associated with the user ID
    // and checking its status if it exists. For now, assume no pending app.
    this.hasPendingApplication = false; // Replace with actual check

    if (this.isAlreadyDoctor || this.hasPendingApplication) {
      return; // Don't build form if already doctor or pending
    }

    this.buildForm(currentUser);
  }

  buildForm(user: any): void { // Pass current user to prefill email/name
     this.applyForm = this.fb.group({
       // Include userId if backend requires it explicitly for apply-doctor
       // userId: [user?._id],
       firstName: [user?.name?.split(' ')[0] || '', [Validators.required]], // Prefill attempt
       lastName: [user?.name?.split(' ')[1] || '', [Validators.required]], // Prefill attempt
       email: [{ value: user?.email || '', disabled: true }, [Validators.required, Validators.email]],
       phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // Basic phone pattern
       website: [''],
       address: ['', [Validators.required]],
       specialization: ['', [Validators.required]],
       experience: ['', [Validators.required]],
       consultationFee: [null, [Validators.required, Validators.min(0)]],
       officeTimeStart: [null, [Validators.required]],
       officeTimeEnd: [null, [Validators.required]]
     });
  }

   // Helper to format Date object from time picker back to HH:mm string
   private formatTime(date: Date | null): string | null {
       if (!date) return null;
       const hours = date.getHours().toString().padStart(2, '0');
       const minutes = date.getMinutes().toString().padStart(2, '0');
       return `${hours}:${minutes}`;
   }


  submitForm(): void {
     if (this.applyForm.invalid) {
      this.markFormDirty(this.applyForm);
      return;
    }

    this.isSubmitting = true;
    const formData = { ...this.applyForm.getRawValue() }; // Use getRawValue for disabled email

    // Format officeTime
    const startTime = this.formatTime(formData.officeTimeStart);
    const endTime = this.formatTime(formData.officeTimeEnd);
     if (startTime && endTime) {
       // Backend expects officeTime as object { start: "HH:mm", end: "HH:mm" } or array ["HH:mm", "HH:mm"]
       // Adjust based on backend doctorModel schema definition!
       // Assuming array format based on profile component:
       formData.officeTime = [startTime, endTime];
    } else {
       this.notificationService.showError("Invalid office hours format.");
       this.isSubmitting = false;
       return;
    }
    delete formData.officeTimeStart;
    delete formData.officeTimeEnd;

     // Add userId if needed (check backend route /apply-doctor)
     // const currentUser = this.userStateService.getCurrentUserValue();
     // formData.userId = currentUser?._id;

    this.userService.applyForDoctor(formData)
       .pipe(finalize(() => this.isSubmitting = false))
       .subscribe({
          next: (res) => {
             if (res.success) {
                this.notificationService.showSuccess(res.message || 'Application submitted successfully!');
                this.hasPendingApplication = true; // Update status visually
                this.applyForm.reset(); // Optionally reset form
                // Optionally navigate away or disable form further
                // this.router.navigate(['/user']);
             } else {
                this.notificationService.showError(res.message || 'Failed to submit application.');
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
