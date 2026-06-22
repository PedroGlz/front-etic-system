import { Injectable } from '@angular/core';
import { BaseCatalogStore } from '@shared/utils/catalog-crud/base-catalog.store';
import { DynamicCatalogService } from '@features/catalogs/shared/data-access/dynamic-catalog.service';

@Injectable()
export class DynamicCatalogStore extends BaseCatalogStore {
  constructor(private readonly dynamicCatalogService: DynamicCatalogService) {
    super(dynamicCatalogService);
  }

  setCatalogKey(catalogKey: string): void {
    this.dynamicCatalogService.setCatalogKey(catalogKey);
  }
}
