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

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PagedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T[];
  errors: string[];
  pagination: PaginationMeta;
}
