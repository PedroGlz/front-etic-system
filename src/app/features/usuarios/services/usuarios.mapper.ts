import { GrupoUsuario, Usuario } from '@features/usuarios/models/usuario.model';
import { GrupoUsuarioResponseDto, UsuarioResponseDto } from '@features/usuarios/models/usuario-response.dto';

export function mapUsuario(response: UsuarioResponseDto): Usuario {
  return {
    id: response.id,
    groupId: response.groupId,
    groupName: response.groupName,
    username: response.username,
    name: response.name,
    email: response.email,
    phone: response.phone,
    certificationLevel: response.certificationLevel,
    status: response.status,
  };
}

export function mapGrupoUsuario(response: GrupoUsuarioResponseDto): GrupoUsuario {
  return {
    id: response.id,
    name: response.name,
    status: response.status,
  };
}
