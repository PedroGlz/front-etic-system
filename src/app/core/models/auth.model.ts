export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
  email: string | null;
  groupId: string | null;
  groupName: string | null;
  title: string | null;
  certificationLevel: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}
