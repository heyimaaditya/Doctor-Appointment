import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Define a User interface based on your backend model
export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isDoctor: boolean;
  notification?: any[]; // Define notification structure if needed
  seenNotification?: any[];
  // Add other relevant fields
}

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Optional: Initialize from storage if user data is persisted
  }

  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    // Optional: Save to storage if needed
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAdmin(): boolean {
    return !!this.currentUserSubject.value?.isAdmin;
  }

  get isDoctor(): boolean {
     return !!this.currentUserSubject.value?.isDoctor;
  }

  clearUser(): void {
    this.currentUserSubject.next(null);
    // Optional: Remove from storage
  }
}