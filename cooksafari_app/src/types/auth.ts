export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresAt: string;
}
