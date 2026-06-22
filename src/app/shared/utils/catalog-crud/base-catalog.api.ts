import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CATALOGS_API_URL } from '@core/http/api-endpoints';
import { CatalogRecord, CatalogSchema } from '@shared/models/catalog.model';

export abstract class BaseCatalogApi {
  protected readonly http = inject(HttpClient);
  protected abstract readonly catalogKey: string;

  schemas(): Observable<CatalogSchema[]> {
    return this.http.get<CatalogSchema[]>(CATALOGS_API_URL, { withCredentials: true });
  }

  records(): Observable<CatalogRecord[]> {
    return this.http.get<CatalogRecord[]>(`${CATALOGS_API_URL}/${this.catalogKey}`, { withCredentials: true });
  }

  recordsByCatalogKey(catalogKey: string): Observable<CatalogRecord[]> {
    return this.http.get<CatalogRecord[]>(`${CATALOGS_API_URL}/${catalogKey}`, { withCredentials: true });
  }

  create(values: Record<string, unknown>): Observable<CatalogRecord> {
    return this.http.post<CatalogRecord>(`${CATALOGS_API_URL}/${this.catalogKey}`, values, { withCredentials: true });
  }

  update(id: string, values: Record<string, unknown>): Observable<CatalogRecord> {
    return this.http.put<CatalogRecord>(`${CATALOGS_API_URL}/${this.catalogKey}/${id}`, values, { withCredentials: true });
  }

  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${CATALOGS_API_URL}/${this.catalogKey}/${id}`, { withCredentials: true });
  }
}
