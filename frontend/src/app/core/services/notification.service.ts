import { Injectable, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar'; // Assuming you're using Material Snackbar for notifications

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(@Inject(MatSnackBar) private snackBar: MatSnackBar) {}

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // Duration for the notification in ms
      panelClass: ['error-snackbar'] // Optional: custom class for styling
    });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // Duration for the notification in ms
      panelClass: ['success-snackbar'] // Optional: custom class for styling
    });
  }
}
