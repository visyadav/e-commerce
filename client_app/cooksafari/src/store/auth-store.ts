import { create } from 'zustand';
import { clientAuthService } from '@/services/api/auth-service';
import { apiClient } from '@/services/api/api-client';

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
  loginWithMobile: (phoneNumber: string, otp?: string, fullName?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
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

        return { success: true, message: 'Logged in successfully!' };
      } else {
        return { success: false, message: res.message || 'Login failed' };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'Login error occurred' };
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
  },
}));
