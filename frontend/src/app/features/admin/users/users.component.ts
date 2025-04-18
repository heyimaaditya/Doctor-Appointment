import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http'; // Direct HttpClient for simplicity, or use a dedicated AdminService
import { environment } from '../../../../environments/environment';
import { Observable, finalize, catchError, of } from 'rxjs';

// NgZorro Modules
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'; // For delete confirmation
import { NzSpinModule } from 'ng-zorro-antd/spin'; // Loading indicator
import { NotificationService } from '../../../core/services/notification.service'; // Use your notification service

// Define ApiResponse interface to handle responses
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  total?: number;
}

// Define UserData interface based on backend data
interface UserData {
  _id: string;
  name: string;
  email: string;
  isDoctor: boolean;
  isAdmin: boolean;
  // Add other fields if needed
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzPopconfirmModule,
    NzSpinModule,
  ],
  template: `
    <h2>Users List</h2>
    <nz-spin [nzSpinning]="loading">
      <nz-table
        #userTable
        nzBordered
        [nzData]="users"
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
            <th>Is Doctor</th>
            <th>Is Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of userTable.data">
            <td>{{ data.name }}</td>
            <td>{{ data.email }}</td>
            <td>{{ data.isDoctor ? 'Yes' : 'No' }}</td>
            <td>{{ data.isAdmin ? 'Yes' : 'No' }}</td>
            <td>
              <button
                 *ngIf="!data.isAdmin"
                 nz-button
                 nzType="link"
                 nzDanger
                 nz-popconfirm
                 nzPopconfirmTitle="Are you sure you want to remove this user?"
                 nzPopconfirmPlacement="top"
                 (nzOnConfirm)="removeUser(data._id)"
                 nzOkText="Yes"
                 nzCancelText="No"
                 [nzLoading]="isRemoving[data._id]"
              >
                Remove
              </button>
              <span *ngIf="data.isAdmin">-</span> </td>
          </tr>
        </tbody>
      </nz-table>
    </nz-spin>
  `,
})
export class UsersComponent implements OnInit {
  users: UserData[] = [];
  loading = false;
  total = 0;
  pageSize = 10;
  pageIndex = 1;
  isRemoving: { [key: string]: boolean } = {}; // Track removal loading state per user

  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private apiUrl = environment.apiUrl + '/admin';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(pageIndex: number = this.pageIndex, pageSize: number = this.pageSize): void {
    this.loading = true;
    // NOTE: Add query params for pagination if backend supports it!
    // const params = { page: pageIndex, limit: pageSize };
    this.http.get<ApiResponse<UserData[]>>(`${this.apiUrl}/getAllUsers` /*, { params }*/)
      .pipe(
        finalize(() => this.loading = false),
        catchError(err => {
          this.notificationService.showError(err.error?.message || 'Failed to load users');
          return of({ success: false, data: [], total: 0, message: err.error?.message || 'Failed to load users' }); // Return empty on error with total as 0 and message
        })
      )
      .subscribe(res => {
        if (res.success) {
          this.users = res.data ?? []; // Safely assign the data
          this.total = res.total ?? (res.data ?? []).length; // Use total from backend if available
        } else if (res.message) {
          this.notificationService.showError(res.message ?? 'An error occurred while removing the user');
        }
      });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
     const { pageSize, pageIndex, sort, filter } = params;
     // Implement server-side sorting/filtering/pagination if backend supports it
     // For now, just basic client-side pagination update
     this.pageIndex = pageIndex;
     this.pageSize = pageSize;
     // Reload data if backend handles pagination
     // this.loadUsers(pageIndex, pageSize);
  }

  removeUser(userId: string): void {
    this.isRemoving[userId] = true; // Set loading state for this specific button
    this.http.post<ApiResponse<{ message: string }>>(`${this.apiUrl}/removeUser`, { userId })
       .pipe(finalize(() => this.isRemoving[userId] = false))
       .subscribe({
         next: (res) => {
           if (res.success) {
             this.notificationService.showSuccess(res.message || 'Operation successful');
             this.loadUsers(); // Refresh the list
           } else {
             this.notificationService.showError(res.message || 'Operation successful');
           }
         },
         error: (err) => {
           this.notificationService.showError(err.error?.message || 'Failed to remove user');
         }
       });
  }
}
