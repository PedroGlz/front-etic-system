import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { UsuariosService } from '@features/usuarios/services/usuarios.service';
import { GrupoUsuario, Usuario } from '@features/usuarios/models/usuario.model';
import { UsuarioRequestDto } from '@features/usuarios/models/usuario-request.dto';

type UsuarioFormGroup = FormGroup<{
  groupId: FormControl<string>;
  username: FormControl<string>;
  name: FormControl<string>;
  password: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  certificationLevel: FormControl<string>;
}>;

@Injectable()
export class UsuariosStore {
  readonly users = signal<Usuario[]>([]);
  readonly groups = signal<GrupoUsuario[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly dialogVisible = signal(false);
  readonly editingUser = signal<Usuario | null>(null);

  form: UsuarioFormGroup = this.createForm();

  constructor(private readonly service: UsuariosService) {}

  load(): void {
    this.loading.set(true);
    forkJoin({
      users: this.service.getUsers(),
      groups: this.service.getGroups(),
    }).subscribe({
      next: ({ users, groups }) => {
        this.users.set(users);
        this.groups.set(groups.filter((group) => group.status === 'Activo'));
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        void Swal.fire('No fue posible cargar los usuarios', this.errorMessage(error), 'error');
      },
    });
  }

  openCreate(): void {
    this.editingUser.set(null);
    this.form = this.createForm();
    this.dialogVisible.set(true);
  }

  openEdit(user: Usuario): void {
    this.editingUser.set(user);
    this.form = this.createForm(user);
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    const editingUser = this.editingUser();
    this.saving.set(true);

    const request = editingUser
      ? this.service.updateUser(editingUser.id, payload)
      : this.service.createUser(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.load();
        void Swal.fire({
          icon: 'success',
          title: editingUser ? 'Usuario actualizado' : 'Usuario creado',
          timer: 1300,
          showConfirmButton: false,
        });
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        void Swal.fire('No fue posible guardar el usuario', this.errorMessage(error), 'error');
      },
    });
  }

  async deactivate(user: Usuario): Promise<void> {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: '¿Desactivar usuario?',
      text: `El usuario ${user.username} se conservará con estatus Inactivo.`,
      showCancelButton: true,
      confirmButtonText: 'Si, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b42318',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    this.service.deleteUser(user.id).subscribe({
      next: () => {
        this.load();
        void Swal.fire({ icon: 'success', title: 'Usuario desactivado', timer: 1200, showConfirmButton: false });
      },
      error: (error: HttpErrorResponse) => {
        void Swal.fire('No fue posible desactivar el usuario', this.errorMessage(error), 'error');
      },
    });
  }

  async deactivateMany(users: Usuario[], onSuccess: () => void): Promise<void> {
    const activeUsers = users.filter((user) => user.status === 'Activo');
    if (!activeUsers.length) return;
    const confirmation = await Swal.fire({ icon: 'warning', title: `¿Desactivar ${activeUsers.length} usuarios?`, text: 'Los usuarios seleccionados quedarán con estatus Inactivo.', showCancelButton: true, confirmButtonText: 'Si, desactivar', cancelButtonText: 'Cancelar', confirmButtonColor: '#b42318' });
    if (!confirmation.isConfirmed) return;
    forkJoin(activeUsers.map((user) => this.service.deleteUser(user.id))).subscribe({ next: () => { onSuccess(); this.load(); void Swal.fire({ icon: 'success', title: 'Usuarios desactivados', timer: 1200, showConfirmButton: false }); }, error: (error: HttpErrorResponse) => void Swal.fire('No fue posible desactivar los usuarios', this.errorMessage(error), 'error') });
  }

  activate(user: Usuario): void {
    this.service.changeStatus(user.id, { status: 'Activo' }).subscribe({
      next: () => {
        this.load();
        void Swal.fire({ icon: 'success', title: 'Usuario activado', timer: 1200, showConfirmButton: false });
      },
      error: (error: HttpErrorResponse) => {
        void Swal.fire('No fue posible activar el usuario', this.errorMessage(error), 'error');
      },
    });
  }

  isInvalid(controlName: keyof UsuarioFormGroup['controls']): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  isEditing(): boolean {
    return this.editingUser() !== null;
  }

  private buildPayload(): UsuarioRequestDto {
    return {
      groupId: this.form.controls.groupId.value,
      username: this.form.controls.username.value,
      name: this.form.controls.name.value,
      password: this.form.controls.password.value,
      email: this.form.controls.email.value,
      phone: this.blankToNull(this.form.controls.phone.value),
      certificationLevel: this.blankToNull(this.form.controls.certificationLevel.value),
    };
  }

  private createForm(user?: Usuario): UsuarioFormGroup {
    const passwordValidators = user ? [Validators.maxLength(100)] : [Validators.required, Validators.maxLength(100)];
    return new FormGroup({
      groupId: new FormControl(user?.groupId ?? '', { nonNullable: true, validators: [Validators.required] }),
      username: new FormControl(user?.username ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
      name: new FormControl(user?.name ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
      password: new FormControl('', { nonNullable: true, validators: passwordValidators }),
      email: new FormControl(user?.email ?? '', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(300)] }),
      phone: new FormControl(user?.phone ?? '', { nonNullable: true, validators: [Validators.maxLength(15)] }),
      certificationLevel: new FormControl(user?.certificationLevel ?? '', { nonNullable: true, validators: [Validators.maxLength(50)] }),
    });
  }

  private blankToNull(value: string): string | null {
    return value.trim() ? value.trim() : null;
  }

  private errorMessage(error: HttpErrorResponse): string {
    return error.error?.detail ?? error.error?.message ?? 'Verifica la conexión con el servidor.';
  }
}
