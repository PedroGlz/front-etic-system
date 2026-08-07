export interface Usuario {
  id: string;
  groupId: string;
  groupName: string | null;
  username: string;
  name: string;
  email: string;
  phone: string | null;
  certificationLevel: string | null;
  status: 'Activo' | 'Inactivo' | string;
}

export interface GrupoUsuario {
  id: string;
  name: string;
  status: string;
}
