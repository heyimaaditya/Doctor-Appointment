import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// NgZorro Modules
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';

// Services
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service'; // Use NotificationService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // For routerLink
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzSpinModule,
    NzAlertModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-form">
        <h2>Login</h2>
        <nz-spin [nzSpinning]="isLoading">
          <form nz-form [formGroup]="loginForm" (ngSubmit)="submitForm()">
            <nz-form-item>
              <nz-form-control nzErrorTip="Please input your Email!">
                <nz-input-group nzPrefixIcon="mail">
                  <input type="email" nz-input formControlName="email" placeholder="Email" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>
            <nz-form-item>
              <nz-form-control nzErrorTip="Please input your Password!">
                <nz-input-group nzPrefixIcon="lock">
                  <input type="password" nz-input formControlName="password" placeholder="Password" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>
            <button nz-button class="login-form-button login-form-margin" [nzType]="'primary'" [disabled]="loginForm.invalid || isLoading">Log in</button>
            Or <a routerLink="/register">register now!</a>
          </form>
          <nz-alert *ngIf="errorMessage" nzType="error" [nzMessage]="errorMessage" nzShowIcon class="error-alert"></nz-alert>
        </nz-spin>
      </div>
    </div>
  `,
   styleUrls: [] // Removed missing stylesheet file reference
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService); // Use injected service
  private router = inject(Router);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      // remember: [true] // Optional
    });
  }

  submitForm(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response && response.success) {
            this.notificationService.showSuccess('Login Successful!'); // Use service
             // Navigation will be handled based on role inside default-layout or guards now
             // Determine initial route based on user role after login
             const user = this.authService.fetchAndSetUserData().subscribe(userData => {
                if (userData?.isAdmin) this.router.navigate(['/admin']);
                else if (userData?.isDoctor) this.router.navigate(['/doctor']);
                else this.router.navigate(['/user']);
             });

          } else {
            // Error message is handled within the authService now using NotificationService
            // this.errorMessage = response?.message || 'Login failed. Please check your credentials.';
          }
        },
        error: (err) => {
          // Error message is handled within the authService now using NotificationService
          this.isLoading = false;
          // this.errorMessage = 'An error occurred during login.';
          console.error('Login error:', err);
        }
      });

    } else {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
