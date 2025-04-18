import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { finalize, catchError, of } from 'rxjs';

// Services
import { UserService, UserAppointmentData } from '../services/user.service'; // Use UserService
import { NotificationService } from '../../../core/services/notification.service';

// NgZorro Modules
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-user-appointments',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzTagModule,
    NzSpinModule,
    NzEmptyModule,
    DatePipe // Add DatePipe
  ],
  providers: [DatePipe], // Provide DatePipe
  template: `
    <h2>My Appointments</h2>
     <nz-spin [nzSpinning]="loading">
      <nz-table
        #appointmentTable
        nzBordered
        [nzData]="appointments"
        [nzLoading]="loading"
        [nzTotal]="total"
        [nzPageSize]="pageSize"
        [nzPageIndex]="pageIndex"
        (nzQueryParams)="onQueryParamsChange($event)"
        [nzNoResult]="noAppointments"
      >
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Specialization</th> <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of appointmentTable.data">
            <td>{{ getDoctorName(data.doctorInfo) }}</td>
            <td>{{ getDoctorSpecialization(data.doctorInfo) }}</td>
            <td>{{ data.date | date:'dd-MM-yyyy' }}</td>
            <td>{{ data.officeTime | date:'HH:mm' }}</td>
            <td>
              <nz-tag [nzColor]="getStatusColor(data.status)">{{ data.status | titlecase }}</nz-tag>
            </td>
          </tr>
        </tbody>
      </nz-table>
      <ng-template #noAppointments>
         <nz-empty nzNotFoundContent="You have no appointments booked." *ngIf="!loading"></nz-empty>
      </ng-template>
    </nz-spin>
  `,
})
export class UserAppointmentsComponent implements OnInit {
  appointments: UserAppointmentData[] = [];
  loading = false;
  total = 0;
  pageSize = 10;
  pageIndex = 1;

  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(pageIndex: number = this.pageIndex, pageSize: number = this.pageSize): void {
    this.loading = true;
    // TODO: Add pagination params when backend supports it
    this.userService.getUserAppointments()
      .pipe(
        finalize(() => this.loading = false),
        catchError(err => {
          this.notificationService.showError(err.error?.message || 'Failed to load appointments');
          return of({ success: false, data: [] });
        })
      )
      .subscribe(res => {
        if (res.success) {
          this.appointments = res.data;
          this.total = res.total ?? res.data.length;
        } else if (res.message) {
          this.notificationService.showError(res.message);
          this.appointments = []; // Clear appointments on error message from API
        }
      });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pageIndex = params.pageIndex;
    this.pageSize = params.pageSize;
    // Reload data if backend handles pagination
    // this.loadAppointments(params.pageIndex, params.pageSize);
  }

  // Helper to extract doctor name (assuming doctorInfo is an object)
  getDoctorName(doctorInfo: any): string {
     if (typeof doctorInfo === 'object' && doctorInfo?.firstName && doctorInfo?.lastName) {
         return `Dr. ${doctorInfo.firstName} ${doctorInfo.lastName}`;
     }
     if (typeof doctorInfo === 'string') {
         return doctorInfo; // Fallback if it's just a string
     }
     return 'N/A';
  }
   // Helper to extract doctor specialization
   getDoctorSpecialization(doctorInfo: any): string {
      if (typeof doctorInfo === 'object' && doctorInfo?.specialization) {
          return doctorInfo.specialization;
      }
      return 'N/A';
   }


  getStatusColor(status: string): string {
    // Same logic as other components
    switch (status?.toLowerCase()) {
      case 'pending': return 'orange';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      default: return 'default';
    }
  }
}