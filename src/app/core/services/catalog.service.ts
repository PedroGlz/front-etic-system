import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogRecord, CatalogSchema } from '../models/catalog.model';

const API_URL = 'http://localhost:8080/api/catalogos';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private readonly http: HttpClient) {}

  schemas(): Observable<CatalogSchema[]> {
    return this.http.get<CatalogSchema[]>(API_URL, { withCredentials: true });
  }

  records(catalogKey: string): Observable<CatalogRecord[]> {
    return this.http.get<CatalogRecord[]>(`${API_URL}/${catalogKey}`, { withCredentials: true });
  }

  create(catalogKey: string, values: Record<string, unknown>): Observable<CatalogRecord> {
    return this.http.post<CatalogRecord>(`${API_URL}/${catalogKey}`, values, { withCredentials: true });
  }

  update(catalogKey: string, id: string, values: Record<string, unknown>): Observable<CatalogRecord> {
    return this.http.put<CatalogRecord>(`${API_URL}/${catalogKey}/${id}`, values, { withCredentials: true });
  }

  deactivate(catalogKey: string, id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${catalogKey}/${id}`, { withCredentials: true });
  }
}
