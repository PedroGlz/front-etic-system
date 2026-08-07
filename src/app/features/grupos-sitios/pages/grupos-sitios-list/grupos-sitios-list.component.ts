import { Component, ViewChild, computed, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { GruposSitiosApi } from '@features/grupos-sitios/data-access/grupos-sitios.api';
import { GruposSitiosStore } from '@features/grupos-sitios/data-access/grupos-sitios.store';
import { GrupoSitios } from '@features/grupos-sitios/models/grupo-sitios.model';
import { GruposSitiosFormComponent } from '@features/grupos-sitios/pages/grupos-sitios-form/grupos-sitios-form.component';
import { ModuleTableShellComponent } from '@shared/ui/module-table-shell/module-table-shell.component';
import { InactiveRecordsFilterComponent } from '@shared/ui/inactive-records-filter/inactive-records-filter.component';

@Component({
  selector: 'app-grupos-sitios-list',
  imports: [ButtonModule, InputTextModule, TableModule, TagModule, ModuleTableShellComponent, GruposSitiosFormComponent, InactiveRecordsFilterComponent],
  templateUrl: './grupos-sitios-list.component.html',
  styleUrl: './grupos-sitios-list.component.scss',
  providers: [GruposSitiosApi, GruposSitiosStore],
})
export class GruposSitiosListComponent {
  @ViewChild('table') table?: Table;
  readonly showInactive = signal(false);
  readonly visibleRecords = computed(() => this.filterActive(this.store.records()));

  constructor(readonly store: GruposSitiosStore) {
    this.store.load();
  }

  filterGlobal(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.table?.filterGlobal(value, 'contains');
  }

  statusSeverity(status: string): 'success' | 'secondary' {
    return status === 'Activo' ? 'success' : 'secondary';
  }

  trackById(_: number, record: GrupoSitios): string {
    return record.id;
  }

  toggleInactive(checked: boolean): void {
    this.showInactive.set(checked);
    if (this.table) this.table.first = 0;
  }

  private filterActive(records: GrupoSitios[]): GrupoSitios[] {
    return this.showInactive() ? records : records.filter((record) => record.status.trim().toLowerCase() === 'activo');
  }
}
