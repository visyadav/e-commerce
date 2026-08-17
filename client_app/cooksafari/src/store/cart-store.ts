import { create } from 'zustand';
import { cartService } from '@/services/api/cart-service';

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  imageUrl: string;
  isVeg?: boolean;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartStore {
  items: Record<string, CartItem>; // Keyed by productId
  appliedCoupon: string | null;
  discountAmount: number;
  isLoadingServer: boolean;
  
  // Actions
  getItemQuantity: (productId: string) => number;
  addItem: (product: CartProduct, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Computed totals
  getTotalItems: () => number;
  getSubtotal: () => number;
  getOriginalSubtotal: () => number;
  getSavings: () => number;
  getDeliveryFee: () => number;
  getPackagingFee: () => number;
  getGrandTotal: () => number;
  
  // Server sync
  syncWithServer: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: {},
  appliedCoupon: null,
  discountAmount: 0,
  isLoadingServer: false,

  getItemQuantity: (productId: string) => {
    return get().items[productId]?.quantity || 0;
  },

  addItem: (product: CartProduct, qtyToAdd = 1) => {
    set((state) => {
      const existing = state.items[product.id];
      const newQty = (existing?.quantity || 0) + qtyToAdd;
      
      const newItems = {
        ...state.items,
        [product.id]: {
          product,
          quantity: newQty,
        },
      };
      
      return { items: newItems };
    });

    cartService.addToCart({ productId: product.id, quantity: qtyToAdd }).catch(() => {});
  },

  updateQuantity: (productId: string, quantity: number) => {
    set((state) => {
      if (quantity <= 0) {
        const newItems = { ...state.items };
        delete newItems[productId];
        return { items: newItems };
      }

      const existing = state.items[productId];
      if (!existing) return state;

      return {
        items: {
          ...state.items,
          [productId]: {
            ...existing,
            quantity,
          },
        },
      };
    });
  },

  removeItem: (productId: string) => {
    set((state) => {
      const newItems = { ...state.items };
      delete newItems[productId];
      return { items: newItems };
    });
  },

  clearCart: () => {
    set({ items: {}, appliedCoupon: null, discountAmount: 0 });
    cartService.clearCart().catch(() => {});
  },

  applyCoupon: (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'COOK30' || clean === 'FRESH30') {
      const subtotal = get().getSubtotal();
      const disc = Math.min(Math.round(subtotal * 0.3), 100);
      set({ appliedCoupon: clean, discountAmount: disc });
      return { success: true, message: `Coupon ${clean} applied! You saved ₹${disc}` };
    } else if (clean === 'FIRST50') {
      const disc = 50;
      set({ appliedCoupon: clean, discountAmount: disc });
      return { success: true, message: `Coupon FIRST50 applied! You saved ₹50` };
    }
    return { success: false, message: 'Invalid coupon code. Try COOK30 or FIRST50' };
  },

  removeCoupon: () => {
    set({ appliedCoupon: null, discountAmount: 0 });
  },

  getTotalItems: () => {
    return Object.values(get().items).reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return Object.values(get().items).reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  },

  getOriginalSubtotal: () => {
    return Object.values(get().items).reduce(
      (sum, item) => sum + (item.product.originalPrice || item.product.price) * item.quantity,
      0
    );
  },

  getSavings: () => {
    const orig = get().getOriginalSubtotal();
    const current = get().getSubtotal();
    const couponDisc = get().discountAmount;
    return Math.max(0, orig - current + couponDisc);
  },

  getDeliveryFee: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= 300 ? 0 : 35;
  },

  getPackagingFee: () => {
    return get().getSubtotal() > 0 ? 5 : 0;
  },

  getGrandTotal: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    const delivery = get().getDeliveryFee();
    const packaging = get().getPackagingFee();
    const coupon = get().discountAmount;
    return Math.max(0, subtotal + delivery + packaging - coupon);
  },

  syncWithServer: async () => {
    try {
      set({ isLoadingServer: true });
      await cartService.getCart();
    } catch (err) {
      console.warn('Cart server sync notice:', err);
    } finally {
      set({ isLoadingServer: false });
    }
  },
}));
