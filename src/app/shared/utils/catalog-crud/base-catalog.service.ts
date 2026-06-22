import { Observable } from 'rxjs';
import { CatalogRecord, CatalogSchema } from '@shared/models/catalog.model';
import { BaseCatalogApi } from '@shared/utils/catalog-crud/base-catalog.api';

export abstract class BaseCatalogService {
  protected constructor(private readonly api: BaseCatalogApi) {}

  abstract readonly catalogKey: string;

  schemas(): Observable<CatalogSchema[]> {
    return this.api.schemas();
  }

  records(): Observable<CatalogRecord[]> {
    return this.api.records();
  }

  recordsByCatalogKey(catalogKey: string): Observable<CatalogRecord[]> {
    return this.api.recordsByCatalogKey(catalogKey);
  }

  create(values: Record<string, unknown>): Observable<CatalogRecord> {
    return this.api.create(values);
  }

  update(id: string, values: Record<string, unknown>): Observable<CatalogRecord> {
    return this.api.update(id, values);
  }

  deactivate(id: string): Observable<void> {
    return this.api.deactivate(id);
  }
}
