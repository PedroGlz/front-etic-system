export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
  email: string | null;
  firstName: string;
  lastName: string | null;
  system: string;
  roles: string[];
  permissions: string[];
  systemAdmin: boolean;
}

export interface LoginResponse {
  token: string;
  user: Omit<AuthenticatedUser, 'name'>;
}

export interface LoginRequest {
  username: string;
  password: string;
}
