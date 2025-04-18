import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { finalize, catchError, of } from 'rxjs';

// Services
import { UserService } from '../services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DoctorProfileData } from '../../doctor/services/doctor.service'; // Reuse interface

// NgZorro Modules
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty'; // Show if no doctors found

@Component({
  selector: 'app-find-doctor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Needed for routerLink
    NzCardModule,
    NzGridModule,
    NzButtonModule,
    NzSpinModule,
    NzEmptyModule
  ],
  template: `
    <h2>Available Doctors</h2>
    <nz-spin [nzSpinning]="loading">
       <nz-row [nzGutter]="[16, 16]" *ngIf="doctors.length > 0; else noDoctors">
         <nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" [nzLg]="6" *ngFor="let doctor of doctors">
            <nz-card [nzTitle]="'Dr. ' + doctor.firstName + ' ' + doctor.lastName" [nzExtra]="extraTemplate">
               <ng-template #extraTemplate>
                  <button nz-button nzType="primary" nzSize="small" [routerLink]="['/user/book-appointment', doctor._id]">Book Now</button>
               </ng-template>
               <p><strong>Specialization:</strong> {{ doctor.specialization }}</p>
               <p><strong>Experience:</strong> {{ doctor.experience }}</p>
               <p><strong>Fee:</strong> {{ doctor.consultationFee | currency:'INR':'symbol':'1.0-0' }}</p> <p><strong>Address:</strong> {{ doctor.address }}</p>
               <p><strong>Phone:</strong> {{ doctor.phone }}</p>
               <p *ngIf="doctor.website"><a [href]="doctor.website" target="_blank" rel="noopener noreferrer">Website</a></p>
               </nz-card>
         </nz-col>
       </nz-row>
       <ng-template #noDoctors>
          <nz-empty nzNotFoundContent="No doctors found matching criteria." *ngIf="!loading"></nz-empty>
       </ng-template>
    </nz-spin>
  `,
})
export class FindDoctorComponent implements OnInit {
  doctors: DoctorProfileData[] = [];
  loading = true;

  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.userService.getAllDoctorsForUser() // Fetch doctors available to users
      .pipe(
        finalize(() => this.loading = false),
        catchError(err => {
          this.notificationService.showError(err.error?.message || 'Failed to load doctors list');
          return of({ success: false, data: [] });
        })
      )
      .subscribe(res => {
        if (res.success) {
          // Filter only 'accepted' doctors if backend doesn't do it
          this.doctors = res.data.filter(d => d.status === 'accepted');
        } else if (res.message) {
          this.notificationService.showError(res.message);
        }
      });
  }

   // Optional: Helper to format office time if it's an array or object
   formatOfficeTime(time: any): string {
      if (Array.isArray(time) && time.length === 2) {
         return `${time[0]} - ${time[1]}`;
      } else if (typeof time === 'object' && time?.start && time?.end) {
         return `${time.start} - ${time.end}`;
      }
      return 'N/A';
   }
}
