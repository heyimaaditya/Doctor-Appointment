import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { finalize, catchError, of } from 'rxjs';

// Services
import { DoctorService } from '../services/doctor.service'; // Import DoctorService
import { NotificationService } from '../../../core/services/notification.service';

// NgZorro Modules
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';

// Define interfaces
export interface DoctorAppointmentData {
  _id: string;
  userInfo: string;
  date: string; // ISO Date string or Date object
  officeTime: string; // Time string
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  total?: number;
}

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzTagModule,
    NzSpinModule,
    DatePipe
  ],
  providers: [DatePipe],
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
      >
        <thead>
          <tr>
            <th>Patient Info</th> <th>Appointment Date</th>
            <th>Appointment Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of appointmentTable.data">
            <td>{{ data.userInfo }}</td> 
            <td>{{ data.date | date:'dd-MM-yyyy' }}</td> 
            <td>{{ data.officeTime | date:'HH:mm' }}</td> 
            <td>
              <nz-tag [nzColor]="getStatusColor(data.status)">{{ data.status | titlecase }}</nz-tag>
            </td>
            <td>
               <ng-container *ngIf="data.status === 'pending'">
                <button nz-button nzType="primary" nzSize="small" (click)="updateStatus(data._id, 'accepted')" [nzLoading]="isUpdatingStatus[data._id]">Accept</button>
                <nz-divider nzType="vertical"></nz-divider>
                <button nz-button nzDanger nzSize="small" (click)="updateStatus(data._id, 'rejected')" [nzLoading]="isUpdatingStatus[data._id]">Reject</button>
              </ng-container>
               <span *ngIf="data.status !== 'pending'">-</span>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-spin>
  `,
})
export class AppointmentsComponent implements OnInit {
   appointments: DoctorAppointmentData[] = [];
   loading = false;
   total = 0;
   pageSize = 10;
   pageIndex = 1;
   isUpdatingStatus: { [key: string]: boolean } = {}; // Track status update loading state per appointment

  private doctorService = inject(DoctorService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.loadAppointments();
  }

   loadAppointments(pageIndex: number = this.pageIndex, pageSize: number = this.pageSize): void {
    this.loading = true;
    this.doctorService.getDoctorAppointments()
      .pipe(
        finalize(() => this.loading = false),
        catchError(err => {
          this.notificationService.showError(err.error?.message || 'Failed to load appointments');
          return of({ success: false, data: [] });
        })
      )
      .subscribe((res: ApiResponse<DoctorAppointmentData[]>) => {
        if (res.success) {
          this.appointments = res.data ?? [];
          this.total = res.total ?? res.data.length;
        } else if (res.message) {
          this.notificationService.showError(res.message);
        }
      });
  }

   onQueryParamsChange(params: NzTableQueryParams): void {
     this.pageIndex = params.pageIndex;
     this.pageSize = params.pageSize;
     // Reload data if backend handles pagination
   }

   updateStatus(appointmentId: string, status: 'accepted' | 'rejected'): void {
     this.isUpdatingStatus[appointmentId] = true;
     this.doctorService.updateAppointmentStatus(appointmentId, status)
       .pipe(finalize(() => this.isUpdatingStatus[appointmentId] = false))
       .subscribe({
         next: (res: ApiResponse<{ message: string }>) => {
           if (res.success) {
             this.notificationService.showSuccess(res.message);
             // Update status locally or reload list
             const index = this.appointments.findIndex(a => a._id === appointmentId);
             if (index > -1) {
                this.appointments[index] = { ...this.appointments[index], status: status };
                this.appointments = [...this.appointments]; // Trigger change detection
             }
           } else {
             this.notificationService.showError(res.message);
           }
         },
         error: (err) => {
           this.notificationService.showError(err.error?.message || 'Failed to update status');
         }
       });
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'orange';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      default: return 'default';
    }
  }
}
