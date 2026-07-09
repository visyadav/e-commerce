export interface BrandDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CreateBrandRequest {
  name: string;
  description?: string;
}

export interface UpdateBrandRequest {
  name: string;
  description?: string;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  parentCategoryId?: string;
  parentCategoryName?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  sortOrder: number;
  parentCategoryId?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
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
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl?: string;
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
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  tags?: string;
  weight: number;
  dimensions?: string;
  categoryId: string;
  brandId?: string;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  tags?: string;
  weight: number;
  dimensions?: string;
  categoryId: string;
  brandId?: string;
}
