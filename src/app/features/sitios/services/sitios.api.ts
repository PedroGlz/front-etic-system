import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CLIENTS_API_URL, SITES_API_URL, SITE_GROUPS_API_URL } from '@core/config/api-endpoints';
import { ClienteLookup, GrupoSitioLookup } from '@shared/contracts/catalog-lookups.model';
import { Sitio, SitioRequest } from '@features/sitios/models/sitio.model';

@Injectable()
export class SitiosApi {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Sitio[]> {
    return this.http.get<Sitio[]>(SITES_API_URL, { withCredentials: true });
  }

  clients(): Observable<ClienteLookup[]> {
    return this.http.get<ClienteLookup[]>(CLIENTS_API_URL, { withCredentials: true });
  }

  siteGroups(): Observable<GrupoSitioLookup[]> {
    return this.http.get<GrupoSitioLookup[]>(SITE_GROUPS_API_URL, { withCredentials: true });
  }

  create(request: SitioRequest): Observable<Sitio> {
    return this.http.post<Sitio>(SITES_API_URL, request, { withCredentials: true });
  }

  update(id: string, request: SitioRequest): Observable<Sitio> {
    return this.http.put<Sitio>(`${SITES_API_URL}/${id}`, request, { withCredentials: true });
  }

  changeStatus(id: string, status: string): Observable<Sitio> {
    return this.http.patch<Sitio>(`${SITES_API_URL}/${id}/estatus`, { status }, { withCredentials: true });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${SITES_API_URL}/${id}`, { withCredentials: true });
  }
}
