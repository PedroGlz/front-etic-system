import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import Swal from 'sweetalert2';
import { AuthService } from '@core/auth/services/auth.service';
import { LoginTransitionService } from '@core/services/login-transition.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss', './login-brand.component.scss', './login-background.component.scss'],
})
export class LoginPageComponent {
  readonly loading = signal(false);
  readonly passwordChangeRequired = signal(false);
  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly passwordForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirmation: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    readonly loginTransition: LoginTransitionService,
    readonly themeService: ThemeService,
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.loginTransition.active()) return;
    this.loginTransition.start();
    this.authService.login(this.form.getRawValue()).subscribe({
      next: (result) => {
        if ('passwordChangeRequired' in result) {
          this.loginTransition.finish();
          this.passwordForm.controls.currentPassword.setValue(this.form.controls.password.value);
          this.passwordChangeRequired.set(true);
          return;
        }
        const user = result;
        void Swal.fire({ icon: 'success', title: `Bienvenido, ${user.name}`, timer: 1400, showConfirmButton: false });
        const target = this.authService.isAdministrator() ? 'clientes' : 'fabricantes';
        void this.router.navigate(['/catalogos', target]).then((navigated) => {
          if (!navigated) this.loginTransition.finish();
        }).catch(() => {
          this.loginTransition.finish();
          void Swal.fire('No fue posible ingresar', 'No se pudo abrir la pantalla principal.', 'error');
        });
      },
      error: (error: HttpErrorResponse) => {
        this.loginTransition.finish();
        void Swal.fire('Acceso denegado', error.error?.detail ?? 'Usuario o contraseña incorrectos', 'error');
      },
    });
  }

  changeRequiredPassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const value = this.passwordForm.getRawValue();
    if (value.newPassword !== value.confirmation) { void Swal.fire('Revisa las contraseñas', 'La confirmación no coincide.', 'warning'); return; }
    this.loading.set(true);
    this.authService.changeRequiredPassword(value.currentPassword, value.newPassword).subscribe({
      next: () => { this.loading.set(false); this.passwordChangeRequired.set(false); this.form.reset(); this.passwordForm.reset(); void Swal.fire('Contraseña actualizada', 'Inicia sesión con tu nueva contraseña.', 'success'); },
      error: (error: HttpErrorResponse) => { this.loading.set(false); void Swal.fire('No fue posible actualizarla', error.error?.detail ?? 'Verifica la contraseña temporal y los requisitos.', 'error'); },
    });
  }
}
