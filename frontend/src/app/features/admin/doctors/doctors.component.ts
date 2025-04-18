import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, catchError, of } from 'rxjs';

// Services
import { AdminService, AdminDoctorData } from '../services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';

// NgZorro Modules
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';

interface DoctorsResponse {
  success: boolean;
  data: AdminDoctorData[];
  message?: string;
  total?: number;
}

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzTagModule,
    NzSpinModule
  ],
  template: `
    <h2>Doctors List</h2>
    <nz-spin [nzSpinning]="loading">
      <nz-table
        #doctorTable
        nzBordered
        [nzData]="doctors"
        [nzLoading]="loading"
        [nzTotal]="total"
        [nzPageSize]="pageSize"
        [nzPageIndex]="pageIndex"
        (nzQueryParams)="onQueryParamsChange($event)"
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Specialization</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of doctorTable.data">
            <td>Dr. {{ data.firstName }} {{ data.lastName }}</td>
            <td>{{ data.email }}</td>
            <td>{{ data.phone }}</td>
            <td>{{ data.specialization }}</td>
            <td>
               <nz-tag [nzColor]="getStatusColor(data.status)">{{ data.status | titlecase }}</nz-tag>
            </td>
            <td>
              <ng-container *ngIf="data.status === 'pending'">
                <button nz-button nzType="primary" nzSize="small" (click)="updateStatus(data, 'accepted')" [nzLoading]="isUpdatingStatus[data._id]">Accept</button>
                <nz-divider nzType="vertical"></nz-divider>
                <button nz-button nzDanger nzSize="small" (click)="updateStatus(data, 'rejected')" [nzLoading]="isUpdatingStatus[data._id]">Reject</button>
              </ng-container>
               <span *ngIf="data.status !== 'pending'">-</span> </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-spin>
  `,
})
export class DoctorsComponent implements OnInit {
  doctors: AdminDoctorData[] = [];
  loading = false;
  total = 0;
  pageSize = 10;
  pageIndex = 1;
  isUpdatingStatus: { [key: string]: boolean } = {};

  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(pageIndex: number = this.pageIndex, pageSize: number = this.pageSize): void {
    this.loading = true;
    this.adminService.getAllDoctors()
      .pipe(
        finalize(() => this.loading = false),
        catchError(err => {
          this.notificationService.showError(err.error?.message || 'Failed to load doctors');
          return of({ success: false, data: [] });
        })
      )
      .subscribe((res: DoctorsResponse) => {
        if (res.success) {
          this.doctors = res.data;
          // Safely access 'total' if it exists, otherwise use the length of data
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
    // this.loadDoctors(params.pageIndex, params.pageSize);
  }

  updateStatus(doctor: AdminDoctorData, status: 'accepted' | 'rejected'): void {
    this.isUpdatingStatus[doctor._id] = true;
    this.adminService.changeDoctorAccountStatus(doctor._id, doctor.userId, status)
      .pipe(finalize(() => this.isUpdatingStatus[doctor._id] = false))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.notificationService.showSuccess(res.message);
            // Update status locally or reload list
            const index = this.doctors.findIndex(d => d._id === doctor._id);
            if (index > -1) {
              this.doctors[index] = { ...this.doctors[index], status: status };
              this.doctors = [...this.doctors]; // Trigger change detection for table
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
    switch (status) {
      case 'pending': return 'orange';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      default: return 'default';
    }
  }
}
