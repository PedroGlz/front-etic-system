import { Component, ViewChild, computed, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ClientesApi } from '@features/clientes/services/clientes.api';
import { ClientesStore } from '@features/clientes/services/clientes.store';
import { Cliente } from '@features/clientes/models/cliente.model';
import { ClientesFormComponent } from '@features/clientes/components/clientes-form/clientes-form.component';
import { ModuleTableShellComponent } from '@shared/components/module-table-shell/module-table-shell.component';
import { InactiveRecordsFilterComponent } from '@shared/components/inactive-records-filter/inactive-records-filter.component';
import { CatalogColumnFilterInteractionDirective } from '@shared/directives/catalog-column-filter-interaction.directive';

@Component({
  selector: 'app-clientes-list',
  imports: [ButtonModule, DialogModule, InputTextModule, TableModule, TagModule, ModuleTableShellComponent, ClientesFormComponent, InactiveRecordsFilterComponent, CatalogColumnFilterInteractionDirective],
  templateUrl: './clientes-list.component.html',
  styleUrl: './clientes-list.component.scss',
  providers: [ClientesApi, ClientesStore],
})
export class ClientesListComponent {
  @ViewChild('table') table?: Table;
  readonly showInactive = signal(false);
  selectedRecords: Cliente[] = [];
  readonly visibleRecords = computed(() => this.filterActive(this.store.records()));

  constructor(readonly store: ClientesStore) {
    this.store.load();
  }

  filterGlobal(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.table?.filterGlobal(value, 'contains');
  }

  statusSeverity(status: string): 'success' | 'secondary' {
    return status === 'Activo' ? 'success' : 'secondary';
  }

  trackById(_: number, record: Cliente): string {
    return record.id;
  }

  toggleInactive(checked: boolean): void {
    this.showInactive.set(checked);
    if (this.table) this.table.first = 0;
  }

  deactivateSelected(): void {
    void this.store.deactivateMany(this.selectedRecords, () => { this.selectedRecords = []; });
  }

  private filterActive(records: Cliente[]): Cliente[] {
    return this.showInactive() ? records : records.filter((record) => record.status.trim().toLowerCase() === 'activo');
  }
}
