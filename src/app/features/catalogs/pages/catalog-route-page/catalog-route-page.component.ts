import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CatalogCrudPageComponent } from '@features/catalogs/components/catalog-crud-page/catalog-crud-page.component';
import { DynamicCatalogApi } from '@features/catalogs/services/dynamic-catalog.api';
import { DynamicCatalogService } from '@features/catalogs/services/dynamic-catalog.service';
import { DynamicCatalogStore } from '@features/catalogs/services/dynamic-catalog.store';

@Component({
  selector: 'app-catalog-route-page',
  imports: [CatalogCrudPageComponent],
  templateUrl: './catalog-route-page.component.html',
  styleUrl: './catalog-route-page.component.scss',
  providers: [DynamicCatalogApi, DynamicCatalogService, DynamicCatalogStore],
})
export class CatalogRoutePageComponent {
  @Input() set excludedFields(fieldNames: string[]) {
    this.store.setExcludedFields(fieldNames);
  }

  @Input() set conditionalRequiredFields(fields: Record<string, string>) {
    this.store.setConditionalRequiredFields(fields);
  }

  @Input() set referenceTextFilterFields(fieldNames: string[]) {
    this.store.setReferenceTextFilterFields(fieldNames);
  }

  @Input() set showCreate(value: boolean) {
    this.store.setActionsVisibility(value, this.store.allowDeactivate());
  }

  @Input() set showDeactivate(value: boolean) {
    this.store.setActionsVisibility(this.store.allowCreate(), value);
  }

  constructor(
    route: ActivatedRoute,
    readonly store: DynamicCatalogStore,
  ) {
    this.store.setCatalogKey(route.snapshot.data['catalogKey'] as string);
    this.store.load();
  }
}
