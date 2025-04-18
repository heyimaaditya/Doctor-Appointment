import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Define interfaces based on your backend models
export interface AdminUserData {
  _id: string;
  name: string;
  email: string;
  isDoctor: boolean;
  isAdmin: boolean;
}

export interface AdminDoctorData {
    _id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: 'pending' | 'accepted' | 'rejected'; // Use specific statuses
    specialization: string;
    // Add other doctor fields returned by the API
}

@Injectable() // Provide in Admin route or component if lazy loaded without 'root'
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/admin';

  getAllUsers(): Observable<{ success: boolean; data: AdminUserData[]; message?: string }> {
    // TODO: Implement pagination params when backend supports it
    return this.http.get<{ success: boolean; data: AdminUserData[]; message?: string }>(`${this.apiUrl}/getAllUsers`);
  }

  getAllDoctors(): Observable<{ success: boolean; data: AdminDoctorData[]; message?: string }> {
     // TODO: Implement pagination params when backend supports it
    return this.http.get<{ success: boolean; data: AdminDoctorData[]; message?: string }>(`${this.apiUrl}/getAllDoctors`);
  }

  removeUser(userId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/removeUser`, { userId });
  }

  changeDoctorAccountStatus(doctorId: string, userId: string, status: 'accepted' | 'rejected'): Observable<{ success: boolean; message: string; data: AdminDoctorData }> {
    return this.http.post<{ success: boolean; message: string; data: AdminDoctorData }>(`${this.apiUrl}/changeAccountStatus`, { doctorId, userId, status });
  }

  // Admin Profile - Assuming admin profile uses the standard user structure
  getAdminProfile(userId: string): Observable<{ success: boolean; data: any; message?: string }> {
     // NOTE: Backend expects userId in body, using POST as defined in backend routes
     return this.http.post<{ success: boolean; data: any; message?: string }>(`${this.apiUrl}/getAdminProfile`, { userId });
  }

  updateAdminProfile(profileData: any): Observable<{ success: boolean; message: string; data: any }> {
     // NOTE: Backend expects userId in body, added by interceptor or passed explicitly
     // Assuming interceptor adds userId, sending only profileData
     return this.http.post<{ success: boolean; message: string; data: any }>(`${this.apiUrl}/updateAdminProfile`, profileData);
  }
}
