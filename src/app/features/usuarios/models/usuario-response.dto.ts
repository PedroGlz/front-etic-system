export interface UsuarioResponseDto {
  id: string;
  groupId: string;
  groupName: string | null;
  username: string;
  name: string;
  email: string;
  phone: string | null;
  certificationLevel: string | null;
  status: string;
}

export interface GrupoUsuarioResponseDto {
  id: string;
  name: string;
  status: string;
}
