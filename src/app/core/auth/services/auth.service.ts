import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthenticatedUser, LoginRequest } from '@core/auth/models/auth.model';
import { AuthApi } from '@core/auth/data-access/auth.api';

const USER_STORAGE_KEY = 'etic-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<AuthenticatedUser | null>(this.readStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor(private readonly authApi: AuthApi) {}

  login(request: LoginRequest): Observable<AuthenticatedUser> {
    return this.authApi.login(request).pipe(tap((user) => this.storeUser(user)));
  }

  logout(): Observable<void> {
    return this.authApi.logout().pipe(tap(() => this.clearUser()));
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
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthenticatedUser;
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  }
}
