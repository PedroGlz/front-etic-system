import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CatalogCrudPageComponent } from '@shared/ui/catalog-crud-page/catalog-crud-page.component';
import { DynamicCatalogApi } from '@features/catalogs/shared/data-access/dynamic-catalog.api';
import { DynamicCatalogService } from '@features/catalogs/shared/data-access/dynamic-catalog.service';
import { DynamicCatalogStore } from '@features/catalogs/shared/data-access/dynamic-catalog.store';

@Component({
  selector: 'app-catalog-route-page',
  imports: [CatalogCrudPageComponent],
  template: '<app-catalog-crud-page [store]="store" />',
  providers: [DynamicCatalogApi, DynamicCatalogService, DynamicCatalogStore],
})
export class CatalogRoutePageComponent {
  constructor(
    route: ActivatedRoute,
    readonly store: DynamicCatalogStore,
  ) {
    this.store.setCatalogKey(route.snapshot.data['catalogKey'] as string);
    this.store.load();
  }
}
