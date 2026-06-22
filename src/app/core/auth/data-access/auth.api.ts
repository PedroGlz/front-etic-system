import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/http/api-endpoints';
import { AuthenticatedUser, LoginRequest } from '@core/auth/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>(`${API_BASE_URL}/auth/login`, request, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
  }
}
