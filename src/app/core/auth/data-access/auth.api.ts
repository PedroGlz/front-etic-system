import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { API_BASE_URL } from '@core/config/api-endpoints';
import { AuthenticatedUser, LoginRequest, LoginResponse } from '@core/auth/models/auth.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    if (!environment.authApiBaseUrl) return throwError(() => new Error('Configurar authApiBaseUrl de License Control'));
    return this.http.post<LoginResponse>(`${environment.authApiBaseUrl}/auth/system-login`, { ...request, system: 'ETIC_ONLINE' });
  }

  changeRequiredPassword(currentPassword: string, newPassword: string, token: string): Observable<void> {
    return this.http.put<void>(`${environment.authApiBaseUrl}/auth/required-password`, { currentPassword, newPassword }, { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) });
  }

  currentUser(): Observable<AuthenticatedUser> {
    return this.http.get<AuthenticatedUser>(`${API_BASE_URL}/web/me`, { withCredentials: true });
  }
}
