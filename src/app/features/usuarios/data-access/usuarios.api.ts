import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { USERS_API_URL } from '@core/http/api-endpoints';
import { UsuarioRequestDto, UsuarioStatusRequestDto } from '@features/usuarios/models/usuario-request.dto';
import { GrupoUsuarioResponseDto, UsuarioResponseDto } from '@features/usuarios/models/usuario-response.dto';

@Injectable()
export class UsuariosApi {
  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<UsuarioResponseDto[]> {
    return this.http.get<UsuarioResponseDto[]>(USERS_API_URL, { withCredentials: true });
  }

  getUserById(id: string): Observable<UsuarioResponseDto> {
    return this.http.get<UsuarioResponseDto>(`${USERS_API_URL}/${id}`, { withCredentials: true });
  }

  getGroups(): Observable<GrupoUsuarioResponseDto[]> {
    return this.http.get<GrupoUsuarioResponseDto[]>(`${USERS_API_URL}/grupos`, { withCredentials: true });
  }

  createUser(request: UsuarioRequestDto): Observable<UsuarioResponseDto> {
    return this.http.post<UsuarioResponseDto>(USERS_API_URL, request, { withCredentials: true });
  }

  updateUser(id: string, request: UsuarioRequestDto): Observable<UsuarioResponseDto> {
    return this.http.put<UsuarioResponseDto>(`${USERS_API_URL}/${id}`, request, { withCredentials: true });
  }

  changeStatus(id: string, request: UsuarioStatusRequestDto): Observable<UsuarioResponseDto> {
    return this.http.patch<UsuarioResponseDto>(`${USERS_API_URL}/${id}/estatus`, request, { withCredentials: true });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${USERS_API_URL}/${id}`, { withCredentials: true });
  }
}
