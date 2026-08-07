export interface UsuarioRequestDto {
  groupId: string;
  username: string;
  name: string;
  password: string;
  email: string;
  phone: string | null;
  certificationLevel: string | null;
}

export interface UsuarioStatusRequestDto {
  status: string;
}
