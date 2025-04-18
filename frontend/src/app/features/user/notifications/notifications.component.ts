import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, catchError, of, map } from 'rxjs';

// Services
import { UserService, NotificationData } from '../services/user.service'; // Use UserService
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router'; // To navigate onClickPath

// NgZorro Modules
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzBadgeModule } from 'ng-zorro-antd/badge'; // Optional: if tracking unread count

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    NzTabsModule,
    NzListModule,
    NzButtonModule,
    NzSpinModule,
    NzEmptyModule,
    NzBadgeModule
  ],
  template: `
    <h2>Notifications</h2>
     <nz-spin [nzSpinning]="isLoading">
       <nz-tabset>
         <nz-tab nzTitle="Unread"> <div class="tab-header">
               <button nz-button nzType="link" (click)="markAllAsRead()" [nzLoading]="isMarkingRead" [disabled]="allNotifications.length === 0">
                  Mark All As Read
               </button>
            </div>
            <nz-list nzItemLayout="horizontal" [nzLoading]="isLoading">
              <nz-list-item *ngFor="let item of allNotifications">
                 <nz-list-item-meta
                    [nzTitle]="notificationTitle"
                    [nzDescription]="item.message"
                  >
                    <ng-template #notificationTitle>
                        <a (click)="handleNotificationClick(item)">{{ item.type }}</a>
                     </ng-template>
                 </nz-list-item-meta>
                 </nz-list-item>
              <nz-empty *ngIf="!isLoading && allNotifications.length === 0" nzNotFoundContent="No unread notifications"></nz-empty>
            </nz-list>
         </nz-tab>

         </nz-tabset>
     </nz-spin>
  `,
   styles: [`
     .tab-header {
       text-align: right;
       margin-bottom: 10px;
     }
     nz-list-item-meta-title > a {
        cursor: pointer;
        color: #1890ff; /* Link color */
     }
     nz-list-item-meta-title > a:hover {
        text-decoration: underline;
     }
   `]
})
export class NotificationsComponent implements OnInit {
  allNotifications: NotificationData[] = [];
  // seenNotifications: NotificationData[] = []; // For optional 'Seen' tab
  isLoading = true;
  isMarkingRead = false;

  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.userService.getAllNotifications()
      .pipe(
        finalize(() => this.isLoading = false),
        catchError(err => {
          this.notificationService.showError(err.error?.message || 'Failed to load notifications');
          return of({ success: false, data: [] });
        }),
        // Assuming backend returns all notifications, not split into read/unread
        map(res => res.success ? res.data : [])
      )
      .subscribe(data => {
        this.allNotifications = data;
        // TODO: Populate seenNotifications if implementing split view based on local storage or backend flag
      });
  }

  markAllAsRead(): void {
     // Assuming '/delete-all-notification' effectively marks them as read or removes them
     this.isMarkingRead = true;
     this.userService.deleteAllNotifications()
       .pipe(finalize(() => this.isMarkingRead = false))
       .subscribe({
          next: (res) => {
             if (res.success) {
                this.notificationService.showSuccess(res.message || 'Notifications marked as read.');
                this.allNotifications = []; // Clear the list visually
                // Optionally update badge count if used in layout
             } else {
                this.notificationService.showError(res.message || 'Failed to mark notifications.');
             }
          },
          error: (err) => {
             this.notificationService.showError(err.error?.message || 'An error occurred.');
          }
       });
  }

   handleNotificationClick(notification: NotificationData): void {
      // TODO: Implement logic to mark *this specific* notification as read if backend supports it.
      // Example:
      // this.userService.markNotificationRead(notification._id).subscribe(...) -> then update local state

      // Navigate if onClickPath is provided
      if (notification.onClickPath) {
         this.router.navigate([notification.onClickPath]);
      }
   }
}
