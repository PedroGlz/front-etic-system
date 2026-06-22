import { Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InspectionFormDialogComponent } from '@features/inspecciones/components/inspection-form-dialog.component';
import { InspectionApi } from '@features/inspecciones/data-access/inspection.api';
import { InspectionService } from '@features/inspecciones/data-access/inspection.service';
import { InspectionStore } from '@features/inspecciones/data-access/inspection.store';
import { InspectionSummary } from '@features/inspecciones/models/inspection.model';
import { ModuleTableShellComponent } from '@shared/ui/module-table-shell/module-table-shell.component';

@Component({
  selector: 'app-inspections-page',
  imports: [DatePipe, ButtonModule, DialogModule, InputTextModule, TableModule, TagModule, ModuleTableShellComponent, InspectionFormDialogComponent],
  templateUrl: './inspections-page.component.html',
  styleUrl: './inspections-page.component.scss',
  providers: [InspectionApi, InspectionService, InspectionStore],
})
export class InspectionsPageComponent {
  private static readonly CLOSED_STATUS = '73F27007-76B3-11D3-82BF-00104BC75DC2';

  @ViewChild('table') table?: Table;

  constructor(readonly store: InspectionStore) {
    this.store.load();
    this.store.loadCurrentSelection();
  }

  continueSelection(): void {
    const selection = this.store.currentSelection();
    const inspection = this.store.inspections().find((item) => item.id === selection?.id);
    if (inspection) {
      this.store.openInspection(inspection);
    }
  }

  filterGlobal(table: Table, event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    table.filterGlobal(value, 'contains');
  }

  onImportFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement | null)?.files?.[0];
    if (!file) {
      return;
    }
    this.store.setImportFileName(file.name);
    this.store.importInspection(file);
    (event.target as HTMLInputElement).value = '';
  }

  statusSeverity(statusName: string | null): 'success' | 'warn' | 'info' | 'danger' | 'secondary' {
    const value = (statusName ?? '').trim().toLowerCase();
    if (value.includes('cerrada')) {
      return 'success';
    }
    if (value.includes('progreso')) {
      return 'warn';
    }
    if (value.includes('pospuesta')) {
      return 'info';
    }
    if (value.includes('terminada')) {
      return 'secondary';
    }
    return 'danger';
  }

  trackById(_: number, inspection: InspectionSummary): string {
    return inspection.id;
  }

  isClosed(inspection: InspectionSummary): boolean {
    return inspection.statusId === InspectionsPageComponent.CLOSED_STATUS;
  }
}
