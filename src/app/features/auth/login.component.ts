import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  readonly loading = signal(false);
  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.authService.login(this.form.getRawValue()).subscribe({
      next: (user) => {
        this.loading.set(false);
        Swal.fire({ icon: 'success', title: `Bienvenido, ${user.name}`, timer: 1400, showConfirmButton: false });
        void this.router.navigate(['/catalogos/grupos']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        Swal.fire('Acceso denegado', error.error?.detail ?? 'Usuario o contraseña incorrectos', 'error');
      },
    });
  }
}
