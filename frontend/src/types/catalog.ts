export interface BrandDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
}

export interface CreateBrandRequest {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
}

export interface UpdateBrandRequest {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  parentCategoryId?: string;
  parentCategoryName?: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  parentCategoryId?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  parentCategoryId?: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description?: string;
  slug: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  imageUrls: string[];
  tags?: string;
  weight: number;
  dimensions?: string;
  categoryId: string;
  categoryName: string;
  brandId?: string;
  brandName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  slug?: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  imageFiles?: File[];
  tags?: string;
  weight: number;
  dimensions?: string;
  categoryId: string;
  brandId?: string;
}

export interface UpdateProductRequest {
  name: string;
  slug?: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  imageFiles?: File[];
  tags?: string;
  weight: number;
  dimensions?: string;
  categoryId: string;
  brandId?: string;
}
