interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}

interface User extends JwtPayload {
  id: number;
  name: string;
  email: string | null;
  username: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  access: string;
  authenticatedUser: User;
}

interface AuthResponse extends LoginResponse {}

interface LogoutResponse {
  success: boolean;
}

export type {
  AuthResponse,
  LoginCredentials,
  LoginResponse,
  LogoutResponse,
  User,
};
