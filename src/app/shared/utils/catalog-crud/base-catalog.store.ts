import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { CatalogField, CatalogRecord, CatalogSchema } from '@shared/models/catalog.model';
import { BaseCatalogService } from '@shared/utils/catalog-crud/base-catalog.service';

export abstract class BaseCatalogStore {
  readonly schema = signal<CatalogSchema | null>(null);
  readonly records = signal<CatalogRecord[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly dialogVisible = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly references = signal<Record<string, CatalogRecord[]>>({});
  readonly recordsVersion = signal(0);

  form = new FormGroup<Record<string, FormControl<unknown>>>({});

  protected constructor(private readonly service: BaseCatalogService) {}

  load(): void {
    this.loading.set(true);
    forkJoin({
      schemas: this.service.schemas(),
      records: this.service.records(),
    }).subscribe({
      next: ({ schemas, records }) => {
        const currentSchema = schemas.find((item) => item.key === this.service.catalogKey) ?? null;
        this.schema.set(currentSchema);
        this.buildForm();
        this.records.set(records);
        this.recordsVersion.update((version) => version + 1);
        this.loadReferences(currentSchema);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        void Swal.fire('No fue posible cargar el catálogo', this.errorMessage(error), 'error');
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.buildForm();
    this.dialogVisible.set(true);
  }

  openEdit(record: CatalogRecord): void {
    this.editingId.set(String(record.values['id']));
    this.buildForm(record.values);
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
  }

  save(): void {
    const currentSchema = this.schema();
    if (!currentSchema || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const id = this.editingId();
    const request = id
      ? this.service.update(id, this.form.getRawValue())
      : this.service.create(this.form.getRawValue());

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.refreshRecords();
        void Swal.fire({
          icon: 'success',
          title: id ? 'Registro actualizado' : 'Registro creado',
          timer: 1300,
          showConfirmButton: false,
        });
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        void Swal.fire('No fue posible guardar', this.errorMessage(error), 'error');
      },
    });
  }

  async deactivate(record: CatalogRecord): Promise<void> {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: '¿Desactivar registro?',
      text: 'El registro permanecerá en la base de datos con estatus Inactivo.',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b42318',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    this.service.deactivate(String(record.values['id'])).subscribe({
      next: () => {
        this.refreshRecords();
        void Swal.fire({ icon: 'success', title: 'Registro desactivado', timer: 1200, showConfirmButton: false });
      },
      error: (error: HttpErrorResponse) => {
        void Swal.fire('No fue posible desactivar', this.errorMessage(error), 'error');
      },
    });
  }

  referenceLabel(field: CatalogField, value: unknown): string {
    const options = this.references()[field.referenceCatalog ?? ''] ?? [];
    const record = options.find((option) => option.values['id'] === value);
    return record ? this.displayValue(record) : String(value ?? '');
  }

  fieldValue(record: CatalogRecord, field: CatalogField): string {
    const value = record.values[field.name];
    if (field.type === 'boolean') {
      return this.booleanValue(value) ? 'Si' : 'No';
    }
    return field.type === 'reference' ? this.referenceLabel(field, value) : String(value ?? '—');
  }

  referenceOptions(field: CatalogField): CatalogRecord[] {
    const options = this.references()[field.referenceCatalog ?? ''] ?? [];
    return options.filter((option) => option.values['status'] === 'Activo' && !this.isDisallowedUserGroup(field, option));
  }

  setDefault(record: CatalogRecord, field: CatalogField): void {
    const id = String(record.values['id']);
    const nextValue = this.booleanValue(record.values[field.name]) ? '0' : '1';
    this.service.update(id, { ...record.values, [field.name]: nextValue }).subscribe({
      next: () => {
        this.refreshRecords();
      },
      error: (error: HttpErrorResponse) => {
        void Swal.fire('No fue posible actualizar el registro default', this.errorMessage(error), 'error');
      },
    });
  }

  optionLabel(record: CatalogRecord): string {
    return this.displayValue(record);
  }

  tableFields(): CatalogField[] {
    return this.schema()?.fields.filter((field) => !field.writeOnly) ?? [];
  }

  tableFieldNames(): string[] {
    return [...this.tableFields().map((field) => `values.${field.name}`), 'values.status'];
  }

  recordStatus(record: CatalogRecord): string {
    return String(record.values['status'] ?? '');
  }

  isInvalid(fieldName: string): boolean {
    const control = this.form.controls[fieldName];
    return !!control?.invalid && !!control.touched;
  }

  private refreshRecords(): void {
    this.service.records().subscribe((records) => {
      this.records.set(records);
      this.recordsVersion.update((version) => version + 1);
    });
  }

  private loadReferences(currentSchema: CatalogSchema | null): void {
    const keys = [
      ...new Set(currentSchema?.fields.map((field) => field.referenceCatalog).filter((key): key is string => !!key) ?? []),
    ];

    if (!keys.length) {
      this.references.set({});
      return;
    }

    forkJoin(Object.fromEntries(keys.map((key) => [key, this.service.recordsByCatalogKey(key)]))).subscribe((references) => {
      this.references.set(references);
    });
  }

  private buildForm(values: Record<string, unknown> = {}): void {
    const controls: Record<string, FormControl<unknown>> = {};

    for (const field of this.schema()?.fields ?? []) {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.maxLength) {
        validators.push(Validators.maxLength(field.maxLength));
      }
      const defaultValue = field.type === 'number' ? 0 : field.type === 'boolean' ? false : '';
      controls[field.name] = new FormControl(this.controlValue(field, values[field.name] ?? defaultValue), validators);
    }

    this.form = new FormGroup(controls);
  }

  private displayValue(record: CatalogRecord): string {
    for (const key of ['name', 'businessName', 'commercialName', 'username', 'email']) {
      const value = record.values[key];
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }

    return String(record.values['id'] ?? '');
  }

  private isDisallowedUserGroup(field: CatalogField, option: CatalogRecord): boolean {
    if (this.service.catalogKey !== 'usuarios' || field.name !== 'groupId') {
      return false;
    }

    const label = this.displayValue(option).trim().toLowerCase();
    return label === 'cliente' || label === 'clientes';
  }

  private controlValue(field: CatalogField, value: unknown): unknown {
    return field.type === 'boolean' ? this.booleanValue(value) : value;
  }

  private booleanValue(value: unknown): boolean {
    return value === true || value === 1 || value === '1' || value === 'true';
  }

  private errorMessage(error: HttpErrorResponse): string {
    return error.error?.detail ?? error.error?.message ?? 'Verifica la conexión con el servidor.';
  }
}
