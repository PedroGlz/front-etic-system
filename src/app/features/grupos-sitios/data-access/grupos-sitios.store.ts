import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { Cliente } from '@features/clientes/models/cliente.model';
import { GruposSitiosApi } from '@features/grupos-sitios/data-access/grupos-sitios.api';
import { GrupoSitios, GrupoSitiosRequest } from '@features/grupos-sitios/models/grupo-sitios.model';

type GrupoSitiosForm = FormGroup<{
  clientId: FormControl<string>;
  name: FormControl<string>;
}>;

@Injectable()
export class GruposSitiosStore {
  readonly records = signal<GrupoSitios[]>([]);
  readonly clients = signal<Cliente[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly dialogVisible = signal(false);
  readonly editing = signal<GrupoSitios | null>(null);

  form: GrupoSitiosForm = this.createForm();

  constructor(private readonly api: GruposSitiosApi) {}

  load(): void {
    this.loading.set(true);
    forkJoin({ records: this.api.list(), clients: this.api.clients() }).subscribe({
      next: ({ records, clients }) => {
        this.records.set(records);
        this.clients.set(clients.filter((client) => client.status === 'Activo'));
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        void Swal.fire('No fue posible cargar los grupos de sitios', this.errorMessage(error), 'error');
      },
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.form = this.createForm();
    this.dialogVisible.set(true);
  }

  openEdit(record: GrupoSitios): void {
    this.editing.set(record);
    this.form = this.createForm(record);
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
    const editing = this.editing();
    this.saving.set(true);
    const request = editing ? this.api.update(editing.id, this.payload()) : this.api.create(this.payload());
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.load();
        void Swal.fire({ icon: 'success', title: editing ? 'Grupo actualizado' : 'Grupo creado', timer: 1200, showConfirmButton: false });
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        void Swal.fire('No fue posible guardar el grupo', this.errorMessage(error), 'error');
      },
    });
  }

  async deactivate(record: GrupoSitios): Promise<void> {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: '¿Desactivar grupo?',
      text: `El grupo ${record.name} se conservará con estatus Inactivo.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b42318',
    });
    if (!confirmation.isConfirmed) {
      return;
    }
    this.api.delete(record.id).subscribe({
      next: () => this.load(),
      error: (error: HttpErrorResponse) => void Swal.fire('No fue posible desactivar el grupo', this.errorMessage(error), 'error'),
    });
  }

  activate(record: GrupoSitios): void {
    this.api.changeStatus(record.id, 'Activo').subscribe({
      next: () => this.load(),
      error: (error: HttpErrorResponse) => void Swal.fire('No fue posible activar el grupo', this.errorMessage(error), 'error'),
    });
  }

  isInvalid(controlName: keyof GrupoSitiosForm['controls']): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  private payload(): GrupoSitiosRequest {
    return this.form.getRawValue();
  }

  private createForm(record?: GrupoSitios): GrupoSitiosForm {
    return new FormGroup({
      clientId: new FormControl(record?.clientId ?? '', { nonNullable: true, validators: [Validators.required] }),
      name: new FormControl(record?.name ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(300)] }),
    });
  }

  private errorMessage(error: HttpErrorResponse): string {
    return error.error?.detail ?? error.error?.message ?? 'Verifica la conexión con el servidor.';
  }
}
