import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CLIENTS_API_URL } from '@core/config/api-endpoints';
import { Cliente, ClienteRequest } from '@features/clientes/models/cliente.model';

@Injectable()
export class ClientesApi {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(CLIENTS_API_URL, { withCredentials: true });
  }

  create(request: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(CLIENTS_API_URL, request, { withCredentials: true });
  }

  update(id: string, request: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${CLIENTS_API_URL}/${id}`, request, { withCredentials: true });
  }

  changeStatus(id: string, status: string): Observable<Cliente> {
    return this.http.patch<Cliente>(`${CLIENTS_API_URL}/${id}/estatus`, { status }, { withCredentials: true });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${CLIENTS_API_URL}/${id}`, { withCredentials: true });
  }
}
