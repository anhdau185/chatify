interface AuthResponse {
  success: boolean;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  access: string;
}

export { AuthResponse, LoginCredentials, LoginResponse };
