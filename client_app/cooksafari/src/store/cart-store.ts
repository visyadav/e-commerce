import { create } from 'zustand';
import { cartService } from '@/services/api/cart-service';
import { clientCouponService, ApplyCouponRequest } from '@/services/api/coupon-service';

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
  applyCoupon: (code: string, userId?: string) => Promise<{ success: boolean; message: string }>;
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

  applyCoupon: async (code: string, userId?: string) => {
    const clean = code.trim().toUpperCase();
    const itemList = Object.values(get().items);

    if (itemList.length === 0) {
      return { success: false, message: 'Your cart is empty.' };
    }

    const payload: ApplyCouponRequest = {
      code: clean,
      userId,
      items: itemList.map(({ product, quantity }) => ({
        productId: product.id,
        unitPrice: product.price,
        originalPrice: product.originalPrice,
        quantity,
      })),
    };

    try {
      const res = await clientCouponService.applyCoupon(payload);
      if (res.success && res.data && res.data.isValid) {
        set({
          appliedCoupon: clean,
          discountAmount: res.data.discountAmount,
        });
        return { success: true, message: res.data.message };
      } else {
        return {
          success: false,
          message: res.data?.message || res.message || 'Failed to apply coupon.',
        };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error validating coupon.' };
    }
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
