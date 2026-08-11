import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { InspectionService } from '@features/inspecciones/services/inspection.service';
import {
  CatalogOption,
  InspectionSession,
  InspectionSummary,
  InspectionUpsertRequest,
} from '@features/inspecciones/models/inspection.model';

type InspectionFormGroup = FormGroup<{
  clientId: FormControl<string>;
  siteGroupId: FormControl<string>;
  siteId: FormControl<string>;
  statusId: FormControl<string>;
  temperatureUnit: FormControl<string>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<string>;
}>;

const IN_PROGRESS_STATUS = '73F27003-76B3-11D3-82BF-00104BC75DC2';
const CLOSED_STATUS = '73F27007-76B3-11D3-82BF-00104BC75DC2';

@Injectable()
export class InspectionStore {
  readonly inspections = signal<InspectionSummary[]>([]);
  readonly currentSelection = signal<InspectionSession | null>(null);
  readonly clients = signal<CatalogOption[]>([]);
  readonly siteGroups = signal<CatalogOption[]>([]);
  readonly sites = signal<CatalogOption[]>([]);
  readonly statuses = signal<CatalogOption[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly dialogVisible = signal(false);
  readonly importDialogVisible = signal(false);
  readonly importFileName = signal('');
  readonly importFile = signal<File | null>(null);
  readonly importing = signal(false);
  readonly importingInspection = signal<InspectionSummary | null>(null);
  readonly editingInspection = signal<InspectionSummary | null>(null);

  form: InspectionFormGroup = this.createForm();

  constructor(
    private readonly service: InspectionService,
    private readonly router: Router,
  ) {}

  load(): void {
    this.loading.set(true);
    forkJoin({
      inspections: this.service.list(),
      references: this.service.loadReferenceData(),
    }).subscribe({
      next: ({ inspections, references }) => {
        this.inspections.set(inspections);
        this.clients.set(references.clients.map((item) => this.service.clientToOption(item)).filter((item) => item.status === 'Activo'));
        this.siteGroups.set(references.siteGroups.map((item) => this.service.siteGroupToOption(item)).filter((item) => item.status === 'Activo'));
        this.sites.set(references.sites.map((item) => this.service.siteToOption(item)).filter((item) => item.status === 'Activo'));
        this.statuses.set(references.statuses.map((item) => this.service.toOption(item)).filter((item) => item.status === 'Activo'));
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        void Swal.fire('No fue posible cargar las inspecciones', this.errorMessage(error), 'error');
      },
    });
  }

  loadCurrentSelection(): void {
    this.service.currentSelection().subscribe({
      next: (selection) => this.currentSelection.set(selection),
      error: () => this.currentSelection.set(null),
    });
  }

  openCreate(): void {
    this.editingInspection.set(null);
    this.form = this.createForm({
      statusId: IN_PROGRESS_STATUS,
      temperatureUnit: 'C',
      startDate: new Date(),
      endDate: '',
    });
    this.dialogVisible.set(true);
  }

  openEdit(inspection: InspectionSummary): void {
    this.editingInspection.set(inspection);
    this.form = this.createForm({
      clientId: inspection.clientId,
      siteGroupId: inspection.siteGroupId,
      siteId: inspection.siteId,
      statusId: inspection.statusId,
      temperatureUnit: 'C',
      startDate: this.toDateValue(inspection.startDate),
      endDate: this.toDateLocal(inspection.endDate),
    });
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
  }

  openImportDialog(inspection: InspectionSummary): void {
    this.importFileName.set('');
    this.importFile.set(null);
    this.importingInspection.set(inspection);
    this.importDialogVisible.set(true);
  }

  closeImportDialog(): void {
    if (this.importing()) {
      return;
    }
    this.importDialogVisible.set(false);
    this.importFileName.set('');
    this.importFile.set(null);
    this.importingInspection.set(null);
  }

  setImportFile(file: File): void {
    this.importFile.set(file);
    this.importFileName.set(file.name);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    this.saving.set(true);
    const editingInspection = this.editingInspection();
    const request = editingInspection
      ? this.service.update(editingInspection.id, payload)
      : this.service.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.load();
        void Swal.fire({
          icon: 'success',
          title: editingInspection ? 'Inspección actualizada' : 'Inspección creada',
          timer: 1400,
          showConfirmButton: false,
        });
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        void Swal.fire('No fue posible guardar la inspección', this.errorMessage(error), 'error');
      },
    });
  }

  openInspection(inspection: InspectionSummary): void {
    this.service.open(inspection.id).subscribe({
      next: (selection) => {
        this.currentSelection.set(selection);
        void this.router.navigate(['/inspecciones/actual']);
      },
      error: (error: HttpErrorResponse) => {
        void Swal.fire('No fue posible abrir la inspección', this.errorMessage(error), 'error');
      },
    });
  }

  async deactivate(inspection: InspectionSummary): Promise<void> {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar inspección?',
      text: `La inspección ${inspection.inspectionNumber ?? ''} y sus detalles se eliminarán permanentemente.`,
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b42318',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    this.service.deactivate(inspection.id).subscribe({
      next: () => {
        this.load();
        void Swal.fire({ icon: 'success', title: 'Inspección eliminada', timer: 1200, showConfirmButton: false });
      },
      error: (error: HttpErrorResponse) => {
        void Swal.fire('No fue posible eliminar la inspección', this.errorMessage(error), 'error');
      },
    });
  }

  async updateStatus(inspection: InspectionSummary): Promise<void> {
    const activeStatuses = this.statuses().filter((item) => item.status === 'Activo');
    const options = Object.fromEntries(activeStatuses.map((item) => [item.id, item.label]));

    const selection = await Swal.fire({
      title: 'Cambiar estatus',
      input: 'select',
      inputOptions: options,
      inputValue: inspection.statusId,
      inputPlaceholder: 'Selecciona un estatus',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => value ? undefined : 'Debes seleccionar un estatus',
    });

    if (!selection.isConfirmed || !selection.value) {
      return;
    }

    let endDate: string | null = null;
    if (selection.value === CLOSED_STATUS) {
      const dateResult = await Swal.fire({
        title: 'Fecha de cierre',
        input: 'datetime-local',
        inputValue: this.currentDateTime(),
        showCancelButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => value ? undefined : 'La fecha final es obligatoria para cerrar la inspección',
      });

      if (!dateResult.isConfirmed || !dateResult.value) {
        return;
      }
      endDate = this.toApiDateTime(dateResult.value);
    }

    this.service.updateStatus(inspection.id, { statusId: selection.value, endDate }).subscribe({
      next: () => {
        this.load();
        this.loadCurrentSelection();
        void Swal.fire({ icon: 'success', title: 'Estatus actualizado', timer: 1200, showConfirmButton: false });
      },
      error: (error: HttpErrorResponse) => {
        void Swal.fire('No fue posible actualizar el estatus', this.errorMessage(error), 'error');
      },
    });
  }

  exportInspection(inspection: InspectionSummary): void {
    const fileName = this.buildExportFileName(inspection);
    this.showExportProcessingAlert(inspection);
    this.service.exportInspection(inspection.id, inspection.siteId, fileName).subscribe({
      next: (response) => {
        this.service.downloadExport(response.fileName).subscribe({
          next: (blob) => {
            this.downloadBlob(blob, response.fileName);
            this.showExportSuccessAlert(response.fileName);
          },
          error: (error: HttpErrorResponse) => {
            this.showExportErrorAlert('No fue posible descargar el paquete exportado', error);
          },
        });
      },
      error: (error: HttpErrorResponse) => {
        this.showExportErrorAlert('No fue posible exportar la inspección', error);
      },
    });
  }

  importInspection(): void {
    const file = this.importFile();
    const inspection = this.importingInspection();
    if (!file || !inspection) {
      return;
    }
    this.importing.set(true);
    void Swal.fire({
      title: 'Actualizando inspección',
      text: 'Validando el paquete ZIP y guardando la información. No cierres esta ventana.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });
    this.service.importInspection(inspection.id, file).subscribe({
      next: (result) => {
        this.importing.set(false);
        this.closeImportDialog();
        this.load();
        void Swal.fire({
          icon: 'success',
          title: 'Inspección actualizada',
          text: `Se procesaron ${result.processedFiles} archivos del paquete.`,
          confirmButtonText: 'Aceptar',
        });
      },
      error: (error: HttpErrorResponse) => {
        this.importing.set(false);
        void Swal.fire('No fue posible importar la inspección', this.errorMessage(error), 'error');
      },
    });
  }

  downloadProblemsReport(inspection: InspectionSummary): void {
    const startDate = this.reportDate(inspection.startDate);
    const endDate = this.reportDate(inspection.endDate ?? inspection.startDate);
    this.service.downloadProblemsReport(inspection.id, startDate, endDate).subscribe({
      next: (blob) => {
        const fileName = `ETIC_LISTADO_DE_PROBLEMAS_${this.slug(inspection.siteName)}_INSPECCION_${inspection.inspectionNumber ?? '0'}.xlsx`;
        this.downloadBlob(blob, fileName);
      },
      error: (error: HttpErrorResponse) => {
        void Swal.fire('No fue posible generar el reporte', this.errorMessage(error), 'error');
      },
    });
  }

  clearSelection(): void {
    this.service.clearSelection().subscribe({
      next: () => this.currentSelection.set(null),
      error: () => this.currentSelection.set(null),
    });
  }

  clientOptions(): CatalogOption[] {
    return this.clients();
  }

  siteGroupOptions(): CatalogOption[] {
    const clientId = this.form.controls.clientId.value;
    return this.siteGroups().filter((item) => item.clientId === clientId);
  }

  siteOptions(): CatalogOption[] {
    const clientId = this.form.controls.clientId.value;
    const siteGroupId = this.form.controls.siteGroupId.value;
    return this.sites().filter((item) => item.clientId === clientId && item.siteGroupId === siteGroupId);
  }

  statusOptions(): CatalogOption[] {
    return this.statuses();
  }

  isEditing(): boolean {
    return this.editingInspection() !== null;
  }

  isClosedSelected(): boolean {
    return this.form.controls.statusId.value === CLOSED_STATUS;
  }

  onClientChange(): void {
    this.form.controls.siteGroupId.setValue('');
    this.form.controls.siteId.setValue('');
  }

  onSiteGroupChange(): void {
    this.form.controls.siteId.setValue('');
  }

  isInvalid(controlName: keyof InspectionFormGroup['controls']): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  private buildPayload(): InspectionUpsertRequest | null {
    if (this.isClosedSelected() && !this.form.controls.endDate.value) {
      this.form.controls.endDate.markAsTouched();
      return null;
    }

    return {
      clientId: this.form.controls.clientId.value,
      siteGroupId: this.form.controls.siteGroupId.value,
      siteId: this.form.controls.siteId.value,
      statusId: this.form.controls.statusId.value,
      temperatureUnit: 'C',
      startDate: this.toApiDateTime(this.toDateInputValue(this.form.controls.startDate.value!)),
      endDate: this.form.controls.endDate.value ? this.toApiDateTime(this.form.controls.endDate.value) : null,
    };
  }

  private createForm(values?: Partial<Omit<InspectionUpsertRequest, 'startDate'> & { startDate: Date | null }>): InspectionFormGroup {
    return new FormGroup({
      clientId: new FormControl(values?.clientId ?? '', { nonNullable: true, validators: [Validators.required] }),
      siteGroupId: new FormControl(values?.siteGroupId ?? '', { nonNullable: true, validators: [Validators.required] }),
      siteId: new FormControl(values?.siteId ?? '', { nonNullable: true, validators: [Validators.required] }),
      statusId: new FormControl(values?.statusId ?? IN_PROGRESS_STATUS, { nonNullable: true, validators: [Validators.required] }),
      temperatureUnit: new FormControl(values?.temperatureUnit ?? 'C', { nonNullable: true, validators: [Validators.required] }),
      startDate: new FormControl<Date | null>(values?.startDate ?? new Date(), { validators: [] }),
      endDate: new FormControl(values?.endDate ?? '', { nonNullable: true }),
    });
  }

  private buildExportFileName(inspection: InspectionSummary): string {
    return `ETIC_${inspection.inspectionNumber ?? '0'}_${this.slug(inspection.clientName)}_${this.slug(inspection.siteName)}.zip`;
  }

  private showExportProcessingAlert(inspection: InspectionSummary): void {
    const inspectionNumber = inspection.inspectionNumber ? ` ${inspection.inspectionNumber}` : '';
    void Swal.fire({
      title: 'Procesando exportación',
      text: `Preparando el paquete ZIP de la inspección${inspectionNumber}.`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });
  }

  private showExportSuccessAlert(fileName: string): void {
    void Swal.fire({
      icon: 'success',
      title: 'Inspección exportada',
      text: `El paquete ${fileName} se descargó correctamente.`,
      timer: 1700,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  private showExportErrorAlert(title: string, error: HttpErrorResponse): void {
    void Swal.fire(title, this.errorMessage(error), 'error');
  }

  private slug(value: string | null): string {
    return (value ?? 'SIN_DATO').replace(/\s+/g, '').replace(/[^A-Za-z0-9_-]/g, '');
  }

  private reportDate(value: string | null): string {
    return value ? value.slice(0, 10) : new Date().toISOString().slice(0, 10);
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private toApiDateTime(value: string): string {
    if (value.length === 10) {
      return `${value}T00:00:00`;
    }
    return value.length === 16 ? `${value}:00` : value;
  }

  private toDateLocal(value: string | null): string {
    return value ? value.slice(0, 10) : '';
  }

  private toDateValue(value: string | null): Date | null {
    if (!value) {
      return null;
    }
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private toDateInputValue(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private currentDateTime(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 16);
  }

  private errorMessage(error: HttpErrorResponse): string {
    return error.error?.detail ?? error.error?.message ?? 'Verifica la conexión con el servidor.';
  }
}
