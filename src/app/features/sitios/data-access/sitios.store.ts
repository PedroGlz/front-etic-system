import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { Cliente } from '@features/clientes/models/cliente.model';
import { GrupoSitios } from '@features/grupos-sitios/models/grupo-sitios.model';
import { SitiosApi } from '@features/sitios/data-access/sitios.api';
import { Sitio, SitioRequest } from '@features/sitios/models/sitio.model';

type SitioForm = FormGroup<{
  clientId: FormControl<string>;
  siteGroupId: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  address: FormControl<string>;
  neighborhood: FormControl<string>;
  state: FormControl<string>;
  municipality: FormControl<string>;
  contact1: FormControl<string>;
  contactRole1: FormControl<string>;
  contact2: FormControl<string>;
  contactRole2: FormControl<string>;
  contact3: FormControl<string>;
  contactRole3: FormControl<string>;
}>;

@Injectable()
export class SitiosStore {
  readonly records = signal<Sitio[]>([]);
  readonly clients = signal<Cliente[]>([]);
  readonly siteGroups = signal<GrupoSitios[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly dialogVisible = signal(false);
  readonly editing = signal<Sitio | null>(null);

  form: SitioForm = this.createForm();

  constructor(private readonly api: SitiosApi) {}

  load(): void {
    this.loading.set(true);
    forkJoin({ records: this.api.list(), clients: this.api.clients(), siteGroups: this.api.siteGroups() }).subscribe({
      next: ({ records, clients, siteGroups }) => {
        this.records.set(records);
        this.clients.set(clients.filter((client) => client.status === 'Activo'));
        this.siteGroups.set(siteGroups.filter((group) => group.status === 'Activo'));
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        void Swal.fire('No fue posible cargar los sitios', this.errorMessage(error), 'error');
      },
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.form = this.createForm();
    this.dialogVisible.set(true);
  }

  openEdit(record: Sitio): void {
    this.editing.set(record);
    this.form = this.createForm(record);
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
  }

  siteGroupOptions(): GrupoSitios[] {
    const clientId = this.form.controls.clientId.value;
    return this.siteGroups().filter((group) => group.clientId === clientId);
  }

  onClientChange(): void {
    this.form.controls.siteGroupId.setValue('');
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
        void Swal.fire({ icon: 'success', title: editing ? 'Sitio actualizado' : 'Sitio creado', timer: 1200, showConfirmButton: false });
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        void Swal.fire('No fue posible guardar el sitio', this.errorMessage(error), 'error');
      },
    });
  }

  async deactivate(record: Sitio): Promise<void> {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: '¿Desactivar sitio?',
      text: `El sitio ${record.name} se conservará con estatus Inactivo.`,
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
      error: (error: HttpErrorResponse) => void Swal.fire('No fue posible desactivar el sitio', this.errorMessage(error), 'error'),
    });
  }

  async deactivateMany(records: Sitio[], onSuccess: () => void): Promise<void> {
    const activeRecords = records.filter((record) => record.status === 'Activo');
    if (!activeRecords.length) return;
    const confirmation = await Swal.fire({ icon: 'warning', title: `¿Desactivar ${activeRecords.length} sitios?`, text: 'Los sitios seleccionados quedarán con estatus Inactivo.', showCancelButton: true, confirmButtonText: 'Sí, desactivar', cancelButtonText: 'Cancelar', confirmButtonColor: '#b42318' });
    if (!confirmation.isConfirmed) return;
    forkJoin(activeRecords.map((record) => this.api.delete(record.id))).subscribe({ next: () => { onSuccess(); this.load(); void Swal.fire({ icon: 'success', title: 'Sitios desactivados', timer: 1200, showConfirmButton: false }); }, error: (error: HttpErrorResponse) => void Swal.fire('No fue posible desactivar los sitios', this.errorMessage(error), 'error') });
  }

  activate(record: Sitio): void {
    this.api.changeStatus(record.id, 'Activo').subscribe({
      next: () => this.load(),
      error: (error: HttpErrorResponse) => void Swal.fire('No fue posible activar el sitio', this.errorMessage(error), 'error'),
    });
  }

  isInvalid(controlName: keyof SitioForm['controls']): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  private payload(): SitioRequest {
    const values = this.form.getRawValue();
    return {
      ...values,
      siteGroupId: this.blankToNull(values.siteGroupId),
      description: this.blankToNull(values.description),
      address: this.blankToNull(values.address),
      neighborhood: this.blankToNull(values.neighborhood),
      state: this.blankToNull(values.state),
      municipality: this.blankToNull(values.municipality),
      contact1: this.blankToNull(values.contact1),
      contactRole1: this.blankToNull(values.contactRole1),
      contact2: this.blankToNull(values.contact2),
      contactRole2: this.blankToNull(values.contactRole2),
      contact3: this.blankToNull(values.contact3),
      contactRole3: this.blankToNull(values.contactRole3),
    };
  }

  private createForm(record?: Sitio): SitioForm {
    return new FormGroup({
      clientId: new FormControl(record?.clientId ?? '', { nonNullable: true, validators: [Validators.required] }),
      siteGroupId: new FormControl(record?.siteGroupId ?? '', { nonNullable: true }),
      name: new FormControl(record?.name ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(300)] }),
      description: new FormControl(record?.description ?? '', { nonNullable: true, validators: [Validators.maxLength(1000)] }),
      address: new FormControl(record?.address ?? '', { nonNullable: true, validators: [Validators.maxLength(500)] }),
      neighborhood: new FormControl(record?.neighborhood ?? '', { nonNullable: true, validators: [Validators.maxLength(200)] }),
      state: new FormControl(record?.state ?? '', { nonNullable: true, validators: [Validators.maxLength(150)] }),
      municipality: new FormControl(record?.municipality ?? '', { nonNullable: true, validators: [Validators.maxLength(150)] }),
      contact1: new FormControl(record?.contact1 ?? '', { nonNullable: true, validators: [Validators.maxLength(200)] }),
      contactRole1: new FormControl(record?.contactRole1 ?? '', { nonNullable: true, validators: [Validators.maxLength(200)] }),
      contact2: new FormControl(record?.contact2 ?? '', { nonNullable: true, validators: [Validators.maxLength(200)] }),
      contactRole2: new FormControl(record?.contactRole2 ?? '', { nonNullable: true, validators: [Validators.maxLength(200)] }),
      contact3: new FormControl(record?.contact3 ?? '', { nonNullable: true, validators: [Validators.maxLength(200)] }),
      contactRole3: new FormControl(record?.contactRole3 ?? '', { nonNullable: true, validators: [Validators.maxLength(200)] }),
    });
  }

  private blankToNull(value: string): string | null {
    return value.trim() ? value.trim() : null;
  }

  private errorMessage(error: HttpErrorResponse): string {
    return error.error?.detail ?? error.error?.message ?? 'Verifica la conexión con el servidor.';
  }
}
