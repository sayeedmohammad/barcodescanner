import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Replace with real API call. Returns true on successful auth.
  async login(username: string, password: string): Promise<boolean> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 150));
    // Demo logic: keep previous behavior until API is wired
    return username === 'user' && password === 'password';
  }
}

