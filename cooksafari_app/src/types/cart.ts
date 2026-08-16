import { Product } from './product';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}
