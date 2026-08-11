import { Component, ViewChild, computed, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SitiosApi } from '@features/sitios/services/sitios.api';
import { SitiosStore } from '@features/sitios/services/sitios.store';
import { Sitio } from '@features/sitios/models/sitio.model';
import { SitiosFormComponent } from '@features/sitios/components/sitios-form/sitios-form.component';
import { ModuleTableShellComponent } from '@shared/components/module-table-shell/module-table-shell.component';
import { InactiveRecordsFilterComponent } from '@shared/components/inactive-records-filter/inactive-records-filter.component';
import { CatalogColumnFilterInteractionDirective } from '@shared/directives/catalog-column-filter-interaction.directive';

@Component({
  selector: 'app-sitios-list',
  imports: [ButtonModule, InputTextModule, TableModule, TagModule, ModuleTableShellComponent, SitiosFormComponent, InactiveRecordsFilterComponent, CatalogColumnFilterInteractionDirective],
  templateUrl: './sitios-list.component.html',
  styleUrl: './sitios-list.component.scss',
  providers: [SitiosApi, SitiosStore],
})
export class SitiosListComponent {
  @ViewChild('table') table?: Table;
  readonly showInactive = signal(false);
  selectedRecords: Sitio[] = [];
  readonly visibleRecords = computed(() => this.filterActive(this.store.records()));

  constructor(readonly store: SitiosStore) {
    this.store.load();
  }

  filterGlobal(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.table?.filterGlobal(value, 'contains');
  }

  statusSeverity(status: string): 'success' | 'secondary' {
    return status === 'Activo' ? 'success' : 'secondary';
  }

  trackById(_: number, record: Sitio): string {
    return record.id;
  }

  relationFilterOptions(field: 'clientName' | 'siteGroupName'): string[] {
    return [...new Set(this.store.records().map((record) => record[field]).filter((value): value is string => !!value))]
      .sort((left, right) => left.localeCompare(right, 'es'));
  }

  toggleInactive(checked: boolean): void {
    this.showInactive.set(checked);
    if (this.table) this.table.first = 0;
  }

  deactivateSelected(): void {
    void this.store.deactivateMany(this.selectedRecords, () => { this.selectedRecords = []; });
  }

  private filterActive(records: Sitio[]): Sitio[] {
    return this.showInactive() ? records : records.filter((record) => record.status.trim().toLowerCase() === 'activo');
  }
}
