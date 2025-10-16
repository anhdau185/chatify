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
  authenticatedUser: {
    id: number;
    name: string;
    email: string | null;
    username: string;
  };
}

export { AuthResponse, LoginCredentials, LoginResponse };
