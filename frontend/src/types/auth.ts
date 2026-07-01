export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: string;
  email: string;
  fullName: string;
  roles: string[];
  themeColor?: string;
}

export interface StoredUser {
  lastName: any;
  firstName: any;
  profileImage: string | Blob | undefined;
  email: string;
  fullName: string;
  roles: string[];
  themeColor?: string;
}
