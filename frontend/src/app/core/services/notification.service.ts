import { Injectable, inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private message = inject(NzMessageService);

  showSuccess(message: string): void {
    this.message.success(message);
  }

  showError(message: string): void {
    this.message.error(message);
  }

  showWarning(message: string): void {
    this.message.warning(message);
  }

  showInfo(message: string): void {
    this.message.info(message);
  }
}
