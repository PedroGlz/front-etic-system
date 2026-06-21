import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthenticatedUser, LoginRequest } from '../models/auth.model';

const API_URL = 'http://localhost:8080/api';
const USER_STORAGE_KEY = 'etic-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<AuthenticatedUser | null>(this.readStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthenticatedUser> {
    return this.http
      .post<AuthenticatedUser>(`${API_URL}/auth/login`, request, { withCredentials: true })
      .pipe(tap((user) => this.storeUser(user)));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${API_URL}/auth/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.clearUser()));
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  private storeUser(user: AuthenticatedUser): void {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private clearUser(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
    this.currentUserSignal.set(null);
  }

  private readStoredUser(): AuthenticatedUser | null {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthenticatedUser;
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  }
}
