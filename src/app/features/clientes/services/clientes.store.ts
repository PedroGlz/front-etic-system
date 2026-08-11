import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { ClientesApi } from '@features/clientes/services/clientes.api';
import { Cliente, ClienteRequest } from '@features/clientes/models/cliente.model';

type ClienteForm = FormGroup<{
  businessName: FormControl<string>;
  commercialName: FormControl<string>;
  rfc: FormControl<string>;
}>;

@Injectable()
export class ClientesStore {
  readonly records = signal<Cliente[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly dialogVisible = signal(false);
  readonly editing = signal<Cliente | null>(null);

  form: ClienteForm = this.createForm();

  constructor(private readonly api: ClientesApi) {}

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (records) => {
        this.records.set(records);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        void Swal.fire('No fue posible cargar los clientes', this.errorMessage(error), 'error');
      },
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.form = this.createForm();
    this.dialogVisible.set(true);
  }

  openEdit(record: Cliente): void {
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
        void Swal.fire({ icon: 'success', title: editing ? 'Cliente actualizado' : 'Cliente creado', timer: 1200, showConfirmButton: false });
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        void Swal.fire('No fue posible guardar el cliente', this.errorMessage(error), 'error');
      },
    });
  }

  async deactivate(record: Cliente): Promise<void> {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: '¿Desactivar cliente?',
      text: `El cliente ${record.businessName} se conservará con estatus Inactivo.`,
      showCancelButton: true,
      confirmButtonText: 'Si, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b42318',
    });
    if (!confirmation.isConfirmed) {
      return;
    }
    this.api.delete(record.id).subscribe({
      next: () => {
        this.load();
        void Swal.fire({ icon: 'success', title: 'Cliente desactivado', timer: 1200, showConfirmButton: false });
      },
      error: (error: HttpErrorResponse) => void Swal.fire('No fue posible desactivar el cliente', this.errorMessage(error), 'error'),
    });
  }

  async deactivateMany(records: Cliente[], onSuccess: () => void): Promise<void> {
    const activeRecords = records.filter((record) => record.status === 'Activo');
    if (!activeRecords.length) return;
    const confirmation = await Swal.fire({ icon: 'warning', title: `¿Desactivar ${activeRecords.length} clientes?`, text: 'Los clientes seleccionados quedarán con estatus Inactivo.', showCancelButton: true, confirmButtonText: 'Si, desactivar', cancelButtonText: 'Cancelar', confirmButtonColor: '#b42318' });
    if (!confirmation.isConfirmed) return;
    forkJoin(activeRecords.map((record) => this.api.delete(record.id))).subscribe({ next: () => { onSuccess(); this.load(); void Swal.fire({ icon: 'success', title: 'Clientes desactivados', timer: 1200, showConfirmButton: false }); }, error: (error: HttpErrorResponse) => void Swal.fire('No fue posible desactivar los clientes', this.errorMessage(error), 'error') });
  }

  activate(record: Cliente): void {
    this.api.changeStatus(record.id, 'Activo').subscribe({
      next: () => this.load(),
      error: (error: HttpErrorResponse) => void Swal.fire('No fue posible activar el cliente', this.errorMessage(error), 'error'),
    });
  }

  isInvalid(controlName: keyof ClienteForm['controls']): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  private payload(): ClienteRequest {
    return this.form.getRawValue();
  }

  private createForm(record?: Cliente): ClienteForm {
    return new FormGroup({
      businessName: new FormControl(record?.businessName ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(300)] }),
      commercialName: new FormControl(record?.commercialName ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(300)] }),
      rfc: new FormControl(record?.rfc ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    });
  }

  private errorMessage(error: HttpErrorResponse): string {
    return error.error?.detail ?? error.error?.message ?? 'Verifica la conexión con el servidor.';
  }
}
