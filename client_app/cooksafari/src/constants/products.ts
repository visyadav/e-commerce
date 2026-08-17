export interface ProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  badge?: string;
  discountPercentage?: string;
  rating?: number;
  reviewsCount?: number;
  imageUrl: string;
  category: string;
}

// Dummy product data removed; products are fetched live from API
export const PRODUCTS_DATA: ProductItem[] = [];
