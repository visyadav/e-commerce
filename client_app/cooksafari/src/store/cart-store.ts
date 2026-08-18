import { create } from 'zustand';
import { cartService } from '@/services/api/cart-service';
import { clientCouponService, ApplyCouponRequest } from '@/services/api/coupon-service';
import { formatImageUrl } from '@/services/api/product-service';

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
  cartItemId?: string;
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
          ...existing,
          product,
          quantity: newQty,
        },
      };
      
      return { items: newItems };
    });

    cartService.addToCart({ productId: product.id, quantity: qtyToAdd }).catch(() => {});
  },

  updateQuantity: (productId: string, quantity: number) => {
    const existing = get().items[productId];
    if (!existing) return;

    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    // 1. Immediately update UI state with zero latency
    set((state) => ({
      items: {
        ...state.items,
        [productId]: {
          ...existing,
          quantity,
        },
      },
    }));

    // 2. Sync with backend API
    if (existing.cartItemId) {
      cartService.updateQuantity(existing.cartItemId, { quantity }).catch((err) => {
        console.warn('Backend update quantity sync warning:', err);
      });
    } else {
      const diff = quantity - existing.quantity;
      if (diff !== 0) {
        cartService.addToCart({ productId, quantity: diff }).catch(() => {});
      }
    }

    // 3. Re-calculate coupon discount if coupon is active
    const appliedCoupon = get().appliedCoupon;
    if (appliedCoupon) {
      get().applyCoupon(appliedCoupon);
    }
  },

  removeItem: (productId: string) => {
    const existing = get().items[productId];
    set((state) => {
      const newItems = { ...state.items };
      delete newItems[productId];
      return { items: newItems };
    });

    if (existing?.cartItemId) {
      cartService.removeFromCart(existing.cartItemId).catch(() => {});
    }

    const appliedCoupon = get().appliedCoupon;
    if (appliedCoupon) {
      get().applyCoupon(appliedCoupon);
    }
  },

  clearCart: () => {
    set({ items: {}, appliedCoupon: null, discountAmount: 0 });
    cartService.clearCart().catch(() => {});
  },

  applyCoupon: async (code: string, userId?: string) => {
    const clean = code.trim().toUpperCase();
    const itemList = Object.values(get().items);

    if (itemList.length === 0) {
      set({ appliedCoupon: null, discountAmount: 0 });
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
        // Automatically clear applied coupon if no longer valid (e.g. non-discounted products removed)
        set({ appliedCoupon: null, discountAmount: 0 });
        return {
          success: false,
          message: res.data?.message || res.message || 'Coupon is no longer applicable to your cart.',
        };
      }
    } catch (err: any) {
      set({ appliedCoupon: null, discountAmount: 0 });
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
      const res = await cartService.getCart();
      if (res.success && res.data && Array.isArray(res.data.items)) {
        const localItems = get().items;
        const serverItemsMap: Record<string, CartItem> = {};

        res.data.items.forEach((item) => {
          if (item.productId) {
            const price = item.unitPrice || item.productPrice || 0;
            serverItemsMap[item.productId] = {
              cartItemId: item.id,
              product: {
                id: item.productId,
                name: item.productName || 'Product',
                price: price,
                originalPrice: item.originalPrice,
                unit: item.unit || 'unit',
                imageUrl: formatImageUrl(item.productImageUrl || ''),
              },
              quantity: item.quantity,
            };
          }
        });

        // Merge any local guest items that weren't on server yet
        for (const pid of Object.keys(localItems)) {
          if (!serverItemsMap[pid]) {
            const guestItem = localItems[pid];
            serverItemsMap[pid] = guestItem;
            // Push guest item to server DB
            cartService.addToCart({ productId: pid, quantity: guestItem.quantity }).catch(() => {});
          }
        }

        set({ items: serverItemsMap });
      }
    } catch (err) {
      console.warn('Cart server sync notice:', err);
    } finally {
      set({ isLoadingServer: false });
    }
  },
}));
