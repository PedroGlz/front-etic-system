import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { ClienteLookup, GrupoSitioLookup } from '@shared/contracts/catalog-lookups.model';
import { SitiosApi } from '@features/sitios/services/sitios.api';
import { Sitio, SitioRequest } from '@features/sitios/models/sitio.model';

const SITE_NAME_PATTERN = /^[^,/\\:;*?"<>|áéíóúÁÉÍÓÚñÑ()\[\]&%]*$/;

type SitioForm = FormGroup<{
  clientId: FormControl<string>;
  siteGroupId: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  address: FormControl<string>;
  neighborhood: FormControl<string>;
  state: FormControl<string>;
  municipality: FormControl<string>;
  contacts: FormArray<FormGroup<{
    id: FormControl<string>;
    name: FormControl<string>;
    role: FormControl<string>;
  }>>;
}>;

@Injectable()
export class SitiosStore {
  readonly records = signal<Sitio[]>([]);
  readonly clients = signal<ClienteLookup[]>([]);
  readonly siteGroups = signal<GrupoSitioLookup[]>([]);
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

  siteGroupOptions(): GrupoSitioLookup[] {
    const clientId = this.form.controls.clientId.value;
    return this.siteGroups().filter((group) => group.clientId === clientId);
  }

  onClientChange(): void {
    this.form.controls.siteGroupId.setValue('');
  }

  addContact(): void {
    this.form.controls.contacts.push(this.createContactForm());
  }

  removeContact(index: number): void {
    this.form.controls.contacts.removeAt(index);
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
      confirmButtonText: 'Si, desactivar',
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
    const confirmation = await Swal.fire({ icon: 'warning', title: `¿Desactivar ${activeRecords.length} sitios?`, text: 'Los sitios seleccionados quedarán con estatus Inactivo.', showCancelButton: true, confirmButtonText: 'Si, desactivar', cancelButtonText: 'Cancelar', confirmButtonColor: '#b42318' });
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
    const contacts = values.contacts
      .map((contact) => ({ id: contact.id || null, name: this.blankToNull(contact.name), role: this.blankToNull(contact.role) }))
      .filter((contact) => contact.name !== null || contact.role !== null);
    return {
      ...values,
      siteGroupId: this.blankToNull(values.siteGroupId),
      description: this.blankToNull(values.description),
      address: this.blankToNull(values.address),
      neighborhood: this.blankToNull(values.neighborhood),
      state: this.blankToNull(values.state),
      municipality: this.blankToNull(values.municipality),
      contacts,
    };
  }

  private createForm(record?: Sitio): SitioForm {
    return new FormGroup({
      clientId: new FormControl(record?.clientId ?? '', { nonNullable: true, validators: [Validators.required] }),
      siteGroupId: new FormControl(record?.siteGroupId ?? '', { nonNullable: true }),
      name: new FormControl(record?.name ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(300), Validators.pattern(SITE_NAME_PATTERN)] }),
      description: new FormControl(record?.description ?? '', { nonNullable: true, validators: [Validators.maxLength(1000)] }),
      address: new FormControl(record?.address ?? '', { nonNullable: true, validators: [Validators.maxLength(500)] }),
      neighborhood: new FormControl(record?.neighborhood ?? '', { nonNullable: true, validators: [Validators.maxLength(200)] }),
      state: new FormControl(record?.state ?? '', { nonNullable: true, validators: [Validators.maxLength(150)] }),
      municipality: new FormControl(record?.municipality ?? '', { nonNullable: true, validators: [Validators.maxLength(150)] }),
      contacts: new FormArray(
        (record?.contacts ?? []).map((contact) => this.createContactForm(contact)),
      ),
    });
  }

  private createContactForm(contact?: { id?: string | null; name?: string | null; role?: string | null }) {
    return new FormGroup({
      id: new FormControl(contact?.id ?? '', { nonNullable: true }),
      name: new FormControl(contact?.name ?? '', { nonNullable: true, validators: [Validators.maxLength(200)] }),
      role: new FormControl(contact?.role ?? '', { nonNullable: true, validators: [Validators.maxLength(200)] }),
    });
  }

  private blankToNull(value: string): string | null {
    return value.trim() ? value.trim() : null;
  }

  private errorMessage(error: HttpErrorResponse): string {
    return error.error?.detail ?? error.error?.message ?? 'Verifica la conexión con el servidor.';
  }
}
