import { Injectable, signal } from '@angular/core';
import { Observable, tap, map, of } from 'rxjs';
import { AuthenticatedUser, LoginRequest } from '@core/auth/models/auth.model';
import { AuthApi } from '@core/auth/data-access/auth.api';

const USER_STORAGE_KEY = 'etic-user';
const TOKEN_STORAGE_KEY = 'etic-web-jwt';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<AuthenticatedUser | null>(this.readStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor(private readonly authApi: AuthApi) {}

  login(request: LoginRequest): Observable<AuthenticatedUser> {
    return this.authApi.login(request).pipe(map((response) => {
      if (response.user.system !== 'ETIC_ONLINE' || !response.user.roles.length) throw new Error('Acceso ETIC_ONLINE requerido');
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      return this.normalize(response.user);
    }), tap((user) => this.storeUser(user)));
  }

  logout(): Observable<void> {
    this.clearUser();
    return of(void 0);
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null && this.token() !== null;
  }

  token(): string | null {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return null;
    try {
      const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const claims = JSON.parse(atob(encoded));
      return claims.system === 'ETIC_ONLINE' && Number.isFinite(claims.exp) && claims.exp * 1000 > Date.now() ? token : null;
    } catch { return null; }
  }

  isAdministrator(): boolean { return this.isAuthenticated(); }

  private normalize(user: Omit<AuthenticatedUser, 'name'>): AuthenticatedUser {
    return { ...user, name: [user.firstName, user.lastName].filter(Boolean).join(' ') };
  }

  validateSession(): Observable<AuthenticatedUser> {
    return this.authApi.currentUser().pipe(map((user) => this.normalize(user)), tap((user) => this.storeUser(user)));
  }

  clearSession(): void {
    this.clearUser();
  }

  private storeUser(user: AuthenticatedUser): void {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private clearUser(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this.currentUserSignal.set(null);
  }

  private readStoredUser(): AuthenticatedUser | null {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    try {
      const user = JSON.parse(stored) as AuthenticatedUser;
      if (user.system !== 'ETIC_ONLINE' || !Array.isArray(user.roles) || !this.token()) throw new Error('Sesión legacy o expirada');
      return user;
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
  }
}
