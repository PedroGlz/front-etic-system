import { Component } from '@angular/core';
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
  constructor(
    route: ActivatedRoute,
    readonly store: DynamicCatalogStore,
  ) {
    this.store.setCatalogKey(route.snapshot.data['catalogKey'] as string);
    this.store.load();
  }
}
