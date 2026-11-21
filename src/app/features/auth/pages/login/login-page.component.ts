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
  readonly recovery = signal(false);
  readonly notice = signal('');
  readonly noticeType = signal<'success'|'info'|'warning'|'error'>('info');
  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly passwordForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirmation: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly recoveryForm = new FormGroup({
    identifier: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
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
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); this.noticeType.set('warning');this.notice.set('Completa la contraseña temporal y la nueva contraseña.');return; }
    const value = this.passwordForm.getRawValue();
    if (value.newPassword !== value.confirmation) { this.noticeType.set('warning');this.notice.set('La confirmación no coincide con la nueva contraseña.');return; }
    this.loading.set(true);
    this.authService.changeRequiredPassword(value.currentPassword, value.newPassword).subscribe({
      next: () => { this.loading.set(false); this.passwordChangeRequired.set(false); this.form.reset(); this.passwordForm.reset();this.noticeType.set('success');this.notice.set('Contraseña actualizada. Inicia sesión con tu nueva contraseña.'); },
      error: (error: HttpErrorResponse) => { this.loading.set(false);this.noticeType.set('error');this.notice.set(error.error?.detail ?? error.error?.message ?? 'No fue posible actualizar la contraseña. Verifica la contraseña temporal y vuelve a intentarlo.'); },
    });
  }

  openRecovery(): void {
    this.recoveryForm.controls.identifier.setValue(this.form.controls.username.value);
    this.notice.set('');
    this.recovery.set(true);
  }

  requestPasswordReset(): void {
    if (this.recoveryForm.invalid || this.loading()) { this.recoveryForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.authService.requestPasswordReset(this.recoveryForm.controls.identifier.value.trim()).subscribe({
      next: (result) => { this.loading.set(false); if(result.status==='ACCEPTED'){this.recovery.set(false);this.recoveryForm.reset();this.noticeType.set('info');this.notice.set(result.message);}else if(result.status==='RATE_LIMITED'){this.noticeType.set('warning');this.notice.set(`${result.message} ${this.waitText(result.retryAfterSeconds)}`);}else{this.noticeType.set('error');this.notice.set(result.message);} },
      error: (error: HttpErrorResponse) => { this.loading.set(false);this.noticeType.set('error');this.notice.set(error.error?.detail ?? error.error?.message ?? 'No fue posible procesar la solicitud. Intenta nuevamente más tarde.'); },
    });
  }
  private waitText(seconds:number):string{const value=Math.max(1,Math.ceil(seconds));return value>=60?`Intenta nuevamente en ${Math.ceil(value/60)} min.`:`Intenta nuevamente en ${value} s.`;}
}
