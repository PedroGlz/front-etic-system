import { Component, ViewChild, effect, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { BaseCatalogStore } from '@shared/utils/catalog-crud/base-catalog.store';

@Component({
  selector: 'app-catalog-crud-page',
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, TableModule, TagModule],
  templateUrl: './catalog-crud-page.component.html',
  styleUrl: './catalog-crud-page.component.scss',
})
export class CatalogCrudPageComponent {
  readonly store = input.required<BaseCatalogStore>();

  @ViewChild('table') table?: Table;

  constructor() {
    effect(() => {
      this.store().recordsVersion();
      queueMicrotask(() => this.table?.reset());
    });
  }

  filterGlobal(table: Table, event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    table.filterGlobal(value, 'contains');
  }
}
