interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  access: string;
}

export { LoginCredentials, LoginResponse };
