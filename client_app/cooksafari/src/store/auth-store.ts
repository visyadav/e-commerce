import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clientAuthService } from '@/services/api/auth-service';
import { apiClient } from '@/services/api/api-client';
import { useCartStore } from '@/store/cart-store';

export interface UserSession {
  id?: string;
  phoneNumber: string;
  fullName: string;
  token: string;
}

export interface PendingCartAction {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    unit: string;
    imageUrl: string;
    isVeg?: boolean;
    stockQuantity?: number;
  };
  quantity: number;
}

interface AuthStore {
  isAuthenticated: boolean;
  token: string | null;
  user: UserSession | null;
  isLoginModalOpen: boolean;
  pendingCartAction: PendingCartAction | null;

  // Actions
  openLoginModal: (pendingAction?: PendingCartAction) => void;
  closeLoginModal: () => void;
  loginWithMobile: (phoneNumber: string, otp?: string, fullName?: string) => Promise<{ success: boolean; message: string; user?: UserSession }>;
  updateName: (fullName: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  initAuth: () => void;
}

// In-memory fallback map for environments where native storage is unavailable
const memoryStorageMap = new Map<string, string>();

const safeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(name);
      }
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        return await AsyncStorage.getItem(name);
      }
      return memoryStorageMap.get(name) || null;
    } catch {
      return memoryStorageMap.get(name) || null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value);
        return;
      }
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(name, value);
        return;
      }
      memoryStorageMap.set(name, value);
    } catch {
      memoryStorageMap.set(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name);
        return;
      }
      if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
        await AsyncStorage.removeItem(name);
        return;
      }
      memoryStorageMap.delete(name);
    } catch {
      memoryStorageMap.delete(name);
    }
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      isLoginModalOpen: false,
      pendingCartAction: null,

      openLoginModal: (pendingAction) => {
        set({ isLoginModalOpen: true, pendingCartAction: pendingAction || null });
      },

      closeLoginModal: () => {
        set({ isLoginModalOpen: false, pendingCartAction: null });
      },

      loginWithMobile: async (phoneNumber: string, otp?: string, fullName?: string) => {
        try {
          const res = await clientAuthService.mobileLogin({
            phoneNumber,
            otp,
            fullName,
          });

          if (res.success && res.data) {
            const token = res.data.accessToken;
            apiClient.setToken(token);

            const session: UserSession = {
              phoneNumber,
              fullName: res.data.fullName || `User ${phoneNumber.slice(-4)}`,
              token,
            };

            set({
              isAuthenticated: true,
              token,
              user: session,
              isLoginModalOpen: false,
            });

            // Automatically sync cart from backend DB on login
            useCartStore.getState().syncWithServer();

            return { success: true, message: 'Logged in successfully!', user: session };
          } else {
            return { success: false, message: res.message || 'Login failed' };
          }
        } catch (err: any) {
          return { success: false, message: err?.message || 'Login error occurred' };
        }
      },

      updateName: async (fullName: string) => {
        try {
          const res = await clientAuthService.updateName(fullName);
          if (res.success) {
            set((state) => {
              if (!state.user) return state;
              return {
                user: {
                  ...state.user,
                  fullName: res.data?.fullName || fullName,
                },
              };
            });
            return { success: true, message: 'Name updated successfully!' };
          }
          return { success: false, message: res.message || 'Failed to update name' };
        } catch (err: any) {
          return { success: false, message: err?.message || 'Error updating name' };
        }
      },

      logout: () => {
        apiClient.setToken(null);
        set({
          isAuthenticated: false,
          token: null,
          user: null,
          isLoginModalOpen: false,
          pendingCartAction: null,
        });
        useCartStore.getState().clearCart();
      },

      initAuth: () => {
        const token = get().token;
        if (token) {
          apiClient.setToken(token);
          useCartStore.getState().syncWithServer();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          apiClient.setToken(state.token);
          useCartStore.getState().syncWithServer();
        }
      },
    }
  )
);
