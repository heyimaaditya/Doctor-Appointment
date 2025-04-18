import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// NgZorro Modules
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';

// Services
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // For routerLink
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSpinModule,
    NzAlertModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-form">
        <h2>Register</h2>
        <nz-spin [nzSpinning]="isLoading">
          <form nz-form [formGroup]="registerForm" (ngSubmit)="submitForm()">
             <nz-form-item>
              <nz-form-control nzErrorTip="Please input your Name!">
                <nz-input-group nzPrefixIcon="user">
                  <input type="text" nz-input formControlName="name" placeholder="Full Name" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-control nzErrorTip="Please input a valid Email!">
                <nz-input-group nzPrefixIcon="mail">
                  <input type="email" nz-input formControlName="email" placeholder="Email" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-control nzErrorTip="Password must be at least 6 characters">
                <nz-input-group nzPrefixIcon="lock">
                  <input type="password" nz-input formControlName="password" placeholder="Password" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
               <nz-form-control nzErrorTip="Please confirm your password">
                  </nz-form-control>
            </nz-form-item>

            <button nz-button class="login-form-button login-form-margin" [nzType]="'primary'" [disabled]="registerForm.invalid || isLoading">Register</button>
            Already have an account? <a routerLink="/login">Login now!</a>
          </form>
           <nz-alert *ngIf="errorMessage" nzType="error" [nzMessage]="errorMessage" nzShowIcon class="error-alert"></nz-alert>
        </nz-spin>
      </div>
    </div>
  `,
   styleUrls: [] // Use shared SCSS
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
       // Add confirm password validation if needed
      // confirmPassword: ['', [Validators.required]]
    }/*, { validators: this.passwordMatchValidator }*/); // Add validator if using confirm password
  }

  /* // Example password match validator (if using confirm password)
  passwordMatchValidator(form: FormGroup) {
     const password = form.get('password');
     const confirmPassword = form.get('confirmPassword');
     return password && confirmPassword && password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }
  */

  submitForm(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      const userData = this.registerForm.value;
      // delete userData.confirmPassword; // Remove confirm password before sending

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response && response.success) {
             // Notification handled in service
             this.router.navigate(['/login']); // Redirect to login after successful registration
          } else {
             // Notification handled in service
             // this.errorMessage = response?.message || 'Registration failed. Please try again.';
          }
        },
        error: (err) => {
           // Notification handled in service
          this.isLoading = false;
          // this.errorMessage = 'An error occurred during registration.';
          console.error('Registration error:', err);
        }
      });

    } else {
      Object.values(this.registerForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}