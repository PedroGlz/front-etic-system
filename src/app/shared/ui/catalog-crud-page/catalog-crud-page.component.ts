import { Component, ViewChild, computed, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { BaseCatalogStore } from '@shared/utils/catalog-crud/base-catalog.store';
import { ModuleTableShellComponent } from '@shared/ui/module-table-shell/module-table-shell.component';
import { InactiveRecordsFilterComponent } from '@shared/ui/inactive-records-filter/inactive-records-filter.component';
import { CatalogColumnFilterInteractionDirective } from '@shared/ui/catalog-column-filter/catalog-column-filter-interaction.directive';
import { CatalogRecord } from '@shared/models/catalog.model';

@Component({
  selector: 'app-catalog-crud-page',
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, TableModule, TagModule, ModuleTableShellComponent, InactiveRecordsFilterComponent, CatalogColumnFilterInteractionDirective],
  templateUrl: './catalog-crud-page.component.html',
  styleUrl: './catalog-crud-page.component.scss',
})
export class CatalogCrudPageComponent {
  readonly store = input.required<BaseCatalogStore>();
  readonly showInactive = signal(false);
  selectedRecords: CatalogRecord[] = [];
  readonly visibleRecords = computed(() => {
    const records = this.store().records();
    return this.showInactive()
      ? records
      : records.filter((record) => this.store().recordStatus(record).trim().toLowerCase() === 'activo');
  });

  @ViewChild('table') table?: Table;

  filterGlobal(table: Table, event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    table.filterGlobal(value, 'contains');
  }

  toggleInactive(checked: boolean): void {
    this.showInactive.set(checked);
    if (this.table) {
      this.table.first = 0;
    }
  }

  deactivateSelected(): void {
    void this.store().deactivateMany(this.selectedRecords, () => { this.selectedRecords = []; });
  }
}
