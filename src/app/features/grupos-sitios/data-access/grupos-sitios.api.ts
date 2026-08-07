import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CLIENTS_API_URL, SITE_GROUPS_API_URL } from '@core/http/api-endpoints';
import { Cliente } from '@features/clientes/models/cliente.model';
import { GrupoSitios, GrupoSitiosRequest } from '@features/grupos-sitios/models/grupo-sitios.model';

@Injectable()
export class GruposSitiosApi {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<GrupoSitios[]> {
    return this.http.get<GrupoSitios[]>(SITE_GROUPS_API_URL, { withCredentials: true });
  }

  clients(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(CLIENTS_API_URL, { withCredentials: true });
  }

  create(request: GrupoSitiosRequest): Observable<GrupoSitios> {
    return this.http.post<GrupoSitios>(SITE_GROUPS_API_URL, request, { withCredentials: true });
  }

  update(id: string, request: GrupoSitiosRequest): Observable<GrupoSitios> {
    return this.http.put<GrupoSitios>(`${SITE_GROUPS_API_URL}/${id}`, request, { withCredentials: true });
  }

  changeStatus(id: string, status: string): Observable<GrupoSitios> {
    return this.http.patch<GrupoSitios>(`${SITE_GROUPS_API_URL}/${id}/estatus`, { status }, { withCredentials: true });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${SITE_GROUPS_API_URL}/${id}`, { withCredentials: true });
  }
}
