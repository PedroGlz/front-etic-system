import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '@core/config/api-endpoints';
import { environment } from '../../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isEticApi = request.url === API_BASE_URL || request.url.startsWith(`${API_BASE_URL}/`);
  const isAuthApi = !!environment.authApiBaseUrl && request.url.startsWith(`${environment.authApiBaseUrl}/`);
  if (isEticApi && (request.url.startsWith(`${API_BASE_URL}/auth/`) || request.url.startsWith(`${API_BASE_URL}/mobile/`))) {
    return throwError(() => new HttpErrorResponse({ status: 403, error: { detail: 'LEGACY_MOBILE_AUTH no disponible para la web' } }));
  }
  const token = auth.token();
  const outgoing = isEticApi && token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(outgoing).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status === 401 && (isEticApi || isAuthApi)) {
      auth.clearSession();
      void router.navigate(['/login']);
    }
    return throwError(() => error);
  }));
};
