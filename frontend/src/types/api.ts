export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface ApiError {
  status: number;
  message: string;
  errors: string[];
}
