interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  access: string;
}

interface LoginError {
  error: string;
}

export { LoginCredentials, LoginResponse, LoginError };
