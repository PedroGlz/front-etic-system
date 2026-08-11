import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UsuariosApi } from '@features/usuarios/services/usuarios.api';
import { mapGrupoUsuario, mapUsuario } from '@features/usuarios/services/usuarios.mapper';
import { UsuarioRequestDto, UsuarioStatusRequestDto } from '@features/usuarios/models/usuario-request.dto';
import { GrupoUsuario, Usuario } from '@features/usuarios/models/usuario.model';

@Injectable()
export class UsuariosService {
  constructor(private readonly api: UsuariosApi) {}

  getUsers(): Observable<Usuario[]> {
    return this.api.getUsers().pipe(map((users) => users.map(mapUsuario)));
  }

  getUserById(id: string): Observable<Usuario> {
    return this.api.getUserById(id).pipe(map(mapUsuario));
  }

  getGroups(): Observable<GrupoUsuario[]> {
    return this.api.getGroups().pipe(map((groups) => groups.map(mapGrupoUsuario)));
  }

  createUser(request: UsuarioRequestDto): Observable<Usuario> {
    return this.api.createUser(request).pipe(map(mapUsuario));
  }

  updateUser(id: string, request: UsuarioRequestDto): Observable<Usuario> {
    return this.api.updateUser(id, request).pipe(map(mapUsuario));
  }

  changeStatus(id: string, request: UsuarioStatusRequestDto): Observable<Usuario> {
    return this.api.changeStatus(id, request).pipe(map(mapUsuario));
  }

  deleteUser(id: string): Observable<void> {
    return this.api.deleteUser(id);
  }
}
