export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  imageUrl?: string;
  images?: string[];
  categoryId: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  productCount?: number;
}
