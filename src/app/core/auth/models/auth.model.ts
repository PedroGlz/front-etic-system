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
  passwordChangeRequired?: boolean;
}

export type LoginResult = AuthenticatedUser | { passwordChangeRequired: true };

export interface LoginRequest {
  username: string;
  password: string;
}
