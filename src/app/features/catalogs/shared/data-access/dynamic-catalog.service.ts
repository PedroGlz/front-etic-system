import { Injectable } from '@angular/core';
import { BaseCatalogService } from '@shared/utils/catalog-crud/base-catalog.service';
import { DynamicCatalogApi } from '@features/catalogs/shared/data-access/dynamic-catalog.api';

@Injectable()
export class DynamicCatalogService extends BaseCatalogService {
  constructor(private readonly dynamicCatalogApi: DynamicCatalogApi) {
    super(dynamicCatalogApi);
  }

  override get catalogKey(): string {
    return this.dynamicCatalogApi.getCatalogKey();
  }

  setCatalogKey(catalogKey: string): void {
    this.dynamicCatalogApi.setCatalogKey(catalogKey);
  }
}
