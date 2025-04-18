import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { UserStateService, User } from './user-state.service';
import { NotificationService } from './notification.service'; 
import { map } from 'rxjs/operators'; // Importing the map operator

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/user'; 
  private loggedInStatus = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private userStateService: UserStateService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.success && response.token) {
          this.storageService.saveToken(response.token);
          this.loggedInStatus.next(true);
          this.fetchAndSetUserData().subscribe();
        } else {
          this.notificationService.showError(response.message || 'Login failed');
        }
      }),
      catchError(error => {
        this.notificationService.showError(error.error?.message || 'Login request failed');
        return of(null);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        if (response && response.success) {
          this.notificationService.showSuccess(response.message || 'Registration successful!');
        } else {
          this.notificationService.showError(response.message || 'Registration failed');
        }
      }),
      catchError(error => {
        this.notificationService.showError(error.error?.message || 'Registration request failed');
        return of(null);
      })
    );
  }

  fetchAndSetUserData(): Observable<User | null> {
    const token = this.storageService.getToken();
    if (!token) {
      this.clearAuthData();
      return of(null);
    }

    return this.http.post<{ success: boolean; data: User; message: string }>(`${this.apiUrl}/getUserData`, {}).pipe(
      tap(response => {
        if (response && response.success) {
          this.userStateService.setCurrentUser(response.data);
        } else {
          this.notificationService.showError(response.message || 'Failed to fetch user data.');
          this.clearAuthData();
          this.router.navigate(['/login']);
        }
      }),
      catchError(error => {
        this.notificationService.showError('Session expired or invalid. Please login again.');
        this.clearAuthData();
        this.router.navigate(['/login']);
        return of(null);
      }),
      map((response: { success: boolean; data: User; message: string } | null) => response?.data || null) // Use map here and provide the correct type for response
    );
  }

  logout(): void {
    this.clearAuthData();
    this.notificationService.showSuccess('Logged out successfully');
    this.router.navigate(['/login']);
  }

  private clearAuthData(): void {
    this.storageService.removeToken();
    this.userStateService.clearUser();
    this.loggedInStatus.next(false);
  }

  isAuthenticated(): Observable<boolean> {
    return this.loggedInStatus.asObservable();
  }

  isLoggedInSync(): boolean {
    return this.loggedInStatus.value;
  }

  hasToken(): boolean {
    return !!this.storageService.getToken();
  }
}

