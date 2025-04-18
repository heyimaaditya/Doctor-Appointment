import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Define interfaces
export interface DoctorProfileData {
    _id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    website?: string;
    address: string;
    specialization: string;
    experience: string;
    consultationFee: number;
    status: string;
    officeTime: { start?: string, end?: string } | string[] | any; // Adjust based on actual backend structure
    // Add other fields
}

export interface DoctorAppointmentData {
    _id: string;
    userId: string; // Patient User ID
    doctorId: string;
    userInfo: string; // Consider making this an object if backend sends structured data
    doctorInfo: string; // Consider making this an object
    date: string; // Or Date object
    status: 'pending' | 'accepted' | 'rejected' | string; // Be specific if possible
    officeTime: string; // Or Date object for the appointment time slot
    // Add other fields
}


@Injectable()
export class DoctorService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/doctor';

  getDoctorProfile(): Observable<{ success: boolean; data: DoctorProfileData; message?: string }> {
     // Assumes backend uses authenticated userId from interceptor
     return this.http.post<{ success: boolean; data: DoctorProfileData; message?: string }>(`${this.apiUrl}/getDoctorProfile`, {});
  }

  updateDoctorProfile(profileData: any): Observable<{ success: boolean; message: string; data: DoctorProfileData }> {
     // Assumes backend uses authenticated userId from interceptor
     return this.http.post<{ success: boolean; message: string; data: DoctorProfileData }>(`${this.apiUrl}/updateDoctorProfile`, profileData);
  }

  getDoctorAppointments(): Observable<{ success: boolean; data: DoctorAppointmentData[]; message?: string }> {
     // Assumes backend uses authenticated userId from interceptor
     // TODO: Add pagination params if backend supports it
     return this.http.get<{ success: boolean; data: DoctorAppointmentData[]; message?: string }>(`${this.apiUrl}/doctor-appointments`);
  }

  updateAppointmentStatus(appointmentId: string, status: 'accepted' | 'rejected'): Observable<{ success: boolean; message: string; data: DoctorAppointmentData }> {
     return this.http.post<{ success: boolean; message: string; data: DoctorAppointmentData }>(`${this.apiUrl}/update-status`, { appointmentId, status });
  }

  // Method needed for booking page to get details of a specific doctor by ID
  getDoctorById(doctorId: string): Observable<{ success: boolean; data: DoctorProfileData; message?: string }> {
      return this.http.post<{ success: boolean; data: DoctorProfileData; message?: string }>(`${this.apiUrl}/getDoctorById`, { doctorId });
  }
}
