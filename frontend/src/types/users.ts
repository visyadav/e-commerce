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

export interface AdminUserDetailsDto extends AdminUserDto {
  profileImageUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  updatedAt?: string;
  themeColor: string;
}

export interface UpdateAdminUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  themeColor?: string;
}
