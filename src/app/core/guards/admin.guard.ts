import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.currentUser()?.groupName === 'Administradores'
    ? true
    : inject(Router).createUrlTree(['/catalogos/fabricantes']);
};
