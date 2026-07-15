export interface AdminUserDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  roles: string[];
  createdBy?: string;
  createdByName?: string;
}

export interface UpdateAdminUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}
