import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CatalogCrudPageComponent } from '@features/catalogs/components/catalog-crud-page/catalog-crud-page.component';
import { DynamicCatalogApi } from '@features/catalogs/services/dynamic-catalog.api';
import { DynamicCatalogService } from '@features/catalogs/services/dynamic-catalog.service';
import { DynamicCatalogStore } from '@features/catalogs/services/dynamic-catalog.store';

@Component({
  selector: 'app-catalog-page',
  imports: [CatalogCrudPageComponent],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
  providers: [DynamicCatalogApi, DynamicCatalogService, DynamicCatalogStore],
})
export class CatalogPageComponent {
  @Input() set excludedFields(value: string[]) { this.store.setExcludedFields(value); }
  @Input() set conditionalRequiredFields(value: Record<string, string>) { this.store.setConditionalRequiredFields(value); }
  @Input() set referenceTextFilterFields(value: string[]) { this.store.setReferenceTextFilterFields(value); }
  @Input() set showCreate(value: boolean) { this.store.setActionsVisibility(value, this.store.allowDeactivate()); }
  @Input() set showDeactivate(value: boolean) { this.store.setActionsVisibility(this.store.allowCreate(), value); }

  constructor(route: ActivatedRoute, readonly store: DynamicCatalogStore) {
    this.store.setCatalogKey(route.snapshot.data['catalogKey'] as string);
    this.store.load();
  }
}
