import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  removeToken(): void {
    localStorage.removeItem('authToken');
  }

  // Add methods for user data if you store it separately
  // saveUser(user: any): void { ... }
  // getUser(): any | null { ... }
  // removeUser(): void { ... }

  clear(): void {
    localStorage.clear(); // Use with caution
  }
}
