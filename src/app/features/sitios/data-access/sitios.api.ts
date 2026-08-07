import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CLIENTS_API_URL, SITES_API_URL, SITE_GROUPS_API_URL } from '@core/http/api-endpoints';
import { Cliente } from '@features/clientes/models/cliente.model';
import { GrupoSitios } from '@features/grupos-sitios/models/grupo-sitios.model';
import { Sitio, SitioRequest } from '@features/sitios/models/sitio.model';

@Injectable()
export class SitiosApi {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Sitio[]> {
    return this.http.get<Sitio[]>(SITES_API_URL, { withCredentials: true });
  }

  clients(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(CLIENTS_API_URL, { withCredentials: true });
  }

  siteGroups(): Observable<GrupoSitios[]> {
    return this.http.get<GrupoSitios[]>(SITE_GROUPS_API_URL, { withCredentials: true });
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
