import { Injectable } from '@angular/core';
import { BaseCatalogStore } from '@features/catalogs/services/base-catalog.store';
import { DynamicCatalogService } from '@features/catalogs/services/dynamic-catalog.service';

@Injectable()
export class DynamicCatalogStore extends BaseCatalogStore {
  constructor(private readonly dynamicCatalogService: DynamicCatalogService) {
    super(dynamicCatalogService);
  }

  setCatalogKey(catalogKey: string): void {
    this.dynamicCatalogService.setCatalogKey(catalogKey);
  }
}
