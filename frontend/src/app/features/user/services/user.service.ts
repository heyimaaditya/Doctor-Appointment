import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DoctorProfileData } from '../../doctor/services/doctor.service'; // Reuse Doctor profile interface

// Define interfaces
export interface UserAppointmentData {
    _id: string;
    userId: string;
    doctorId: string;
    userInfo: string; // Or object
    doctorInfo: DoctorProfileData | string; // Ideally the full doctor info object
    date: string; // Or Date
    status: string;
    officeTime: string; // Or Date
    // Add other fields
}

export interface NotificationData {
    type: string;
    message: string;
    onClickPath?: string;
    // Add other fields like _id, timestamp, readStatus etc. if available
}

@Injectable()
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/user';

  // User Profile
  getUserProfile(userId: string): Observable<{ success: boolean; data: any; message?: string }> {
     // NOTE: Backend expects userId in body
     return this.http.post<{ success: boolean; data: any; message?: string }>(`${this.apiUrl}/getUserProfile`, { userId });
  }

  updateUserProfile(profileData: any): Observable<{ success: boolean; message: string; data: any }> {
     // Assumes userId is added by interceptor or passed in profileData
     return this.http.post<{ success: boolean; message: string; data: any }>(`${this.apiUrl}/updateUserProfile`, profileData);
  }

  // Doctor Related for Users
  applyForDoctor(doctorData: any): Observable<{ success: boolean; message: string }> {
     return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/apply-doctor`, doctorData);
  }

  getAllDoctorsForUser(): Observable<{ success: boolean; data: DoctorProfileData[]; message?: string }> {
     // TODO: Add pagination params if backend supports it
     return this.http.get<{ success: boolean; data: DoctorProfileData[]; message?: string }>(`${this.apiUrl}/getAllDoctors`);
  }

  // Appointments for Users
  getUserAppointments(): Observable<{ success: boolean; data: UserAppointmentData[]; message?: string }> {
     // TODO: Add pagination params if backend supports it
     return this.http.get<{ success: boolean; data: UserAppointmentData[]; message?: string }>(`${this.apiUrl}/user-appointments`);
  }

  checkBookingAvailability(payload: { doctorId: string; date: string; time: string }): Observable<{ success: boolean; message: string }> {
     return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/booking-availability`, payload);
  }

  bookAppointment(bookingData: { doctorId: string; userId: string; doctorInfo: any; userInfo: any; date: string; officeTime: string }): Observable<{ success: boolean; message: string }> {
     // userId might be added by interceptor, confirm backend needs
     return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/book-appointment`, bookingData);
  }

  // Notifications
  getAllNotifications(): Observable<{ success: boolean; data: NotificationData[]; message?: string }> {
     // Assumes userId added by interceptor
     return this.http.post<{ success: boolean; data: NotificationData[]; message?: string }>(`${this.apiUrl}/get-all-notification`, {});
  }

  deleteAllNotifications(): Observable<{ success: boolean; message: string }> {
     // Assumes userId added by interceptor
     return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/delete-all-notification`, {});
  }

   // Add markNotificationAsSeen if backend supports it
}
