import { Injectable } from '@angular/core';
import { CATALOGS_API_URL } from '@core/http/api-endpoints';
import { BaseCatalogApi } from '@shared/utils/catalog-crud/base-catalog.api';
import { CatalogRecord } from '@shared/models/catalog.model';

@Injectable()
export class DynamicCatalogApi extends BaseCatalogApi {
  protected override readonly catalogKey = '';
  private currentKey = '';

  override records() {
    return this.recordsByCatalogKey(this.currentKey);
  }

  override create(values: Record<string, unknown>) {
    this.ensureCatalogKey();
    return this.http.post<CatalogRecord>(this.catalogUrl(), values, { withCredentials: true });
  }

  override update(id: string, values: Record<string, unknown>) {
    this.ensureCatalogKey();
    return this.http.put<CatalogRecord>(`${this.catalogUrl()}/${id}`, values, { withCredentials: true });
  }

  override deactivate(id: string) {
    this.ensureCatalogKey();
    return this.http.delete<void>(`${this.catalogUrl()}/${id}`, { withCredentials: true });
  }

  setCatalogKey(catalogKey: string): void {
    this.currentKey = catalogKey;
  }

  getCatalogKey(): string {
    return this.currentKey;
  }

  private ensureCatalogKey(): void {
    if (!this.currentKey) {
      throw new Error('Catalog key is required');
    }
  }

  private catalogUrl(): string {
    this.ensureCatalogKey();
    return `${CATALOGS_API_URL}/${this.currentKey}`;
  }
}
