import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import Swal from 'sweetalert2';
import { CatalogField, CatalogRecord, CatalogSchema } from '../../core/models/catalog.model';
import { CatalogService } from '../../core/services/catalog.service';

@Component({
  selector: 'app-catalog-page',
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, TableModule, TagModule],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
})
export class CatalogPageComponent implements OnInit, OnDestroy {
  readonly schema = signal<CatalogSchema | null>(null);
  readonly records = signal<CatalogRecord[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly dialogVisible = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly references = signal<Record<string, CatalogRecord[]>>({});
  form = new FormGroup<Record<string, FormControl<unknown>>>({});
  private routeSubscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly catalogService: CatalogService,
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => this.load(params.get('catalogKey') ?? ''));
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
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
    const schema = this.schema();
    if (!schema || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const request = id
      ? this.catalogService.update(schema.key, id, this.form.getRawValue())
      : this.catalogService.create(schema.key, this.form.getRawValue());
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.loadRecords(schema.key);
        void Swal.fire({ icon: 'success', title: id ? 'Registro actualizado' : 'Registro creado', timer: 1300, showConfirmButton: false });
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        void Swal.fire('No fue posible guardar', this.errorMessage(error), 'error');
      },
    });
  }

  async deactivate(record: CatalogRecord): Promise<void> {
    const schema = this.schema();
    if (!schema) return;
    const confirmation = await Swal.fire({
      icon: 'warning', title: '¿Desactivar registro?',
      text: 'El registro permanecerá en la base de datos con estatus Inactivo.',
      showCancelButton: true, confirmButtonText: 'Sí, desactivar', cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b42318',
    });
    if (!confirmation.isConfirmed) return;
    this.catalogService.deactivate(schema.key, String(record.values['id'])).subscribe({
      next: () => {
        this.loadRecords(schema.key);
        void Swal.fire({ icon: 'success', title: 'Registro desactivado', timer: 1200, showConfirmButton: false });
      },
      error: (error: HttpErrorResponse) => void Swal.fire('No fue posible desactivar', this.errorMessage(error), 'error'),
    });
  }

  referenceLabel(field: CatalogField, value: unknown): string {
    const records = this.references()[field.referenceCatalog ?? ''] ?? [];
    return String(records.find((record) => record.values['id'] === value)?.values['name'] ?? value ?? '');
  }

  fieldValue(record: CatalogRecord, field: CatalogField): string {
    const value = record.values[field.name];
    return field.type === 'reference' ? this.referenceLabel(field, value) : String(value ?? '—');
  }

  isInvalid(fieldName: string): boolean {
    const control = this.form.controls[fieldName];
    return control?.invalid && control.touched;
  }

  private load(catalogKey: string): void {
    this.loading.set(true);
    forkJoin({ schemas: this.catalogService.schemas(), records: this.catalogService.records(catalogKey) }).subscribe({
      next: ({ schemas, records }) => {
        const schema = schemas.find((item) => item.key === catalogKey) ?? null;
        this.schema.set(schema);
        this.buildForm();
        this.records.set(records);
        this.loadReferences(schema);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        void Swal.fire('No fue posible cargar el catálogo', this.errorMessage(error), 'error');
      },
    });
  }

  private loadRecords(catalogKey: string): void {
    this.catalogService.records(catalogKey).subscribe((records) => this.records.set(records));
  }

  private loadReferences(schema: CatalogSchema | null): void {
    const keys = [...new Set(schema?.fields.map((field) => field.referenceCatalog).filter((key): key is string => !!key) ?? [])];
    if (!keys.length) {
      this.references.set({});
      return;
    }
    forkJoin(Object.fromEntries(keys.map((key) => [key, this.catalogService.records(key)]))).subscribe((references) =>
      this.references.set(references),
    );
  }

  private buildForm(values: Record<string, unknown> = {}): void {
    const controls: Record<string, FormControl<unknown>> = {};
    for (const field of this.schema()?.fields ?? []) {
      const validators = [];
      if (field.required) validators.push(Validators.required);
      if (field.maxLength) validators.push(Validators.maxLength(field.maxLength));
      controls[field.name] = new FormControl(values[field.name] ?? (field.type === 'number' ? 0 : ''), validators);
    }
    this.form = new FormGroup(controls);
  }

  private errorMessage(error: HttpErrorResponse): string {
    return error.error?.detail ?? error.error?.message ?? 'Verifica la conexión con el servidor.';
  }
}
