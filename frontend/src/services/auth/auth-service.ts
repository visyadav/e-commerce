import { apiClient } from "../api-client";
import type { LoginRequest, RegisterRequest, AuthResponse, StoredUser } from "@/src/types/auth";
import Cookies from "js-cookie";

const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
} as const;

export const authService = {
  login: (payload: LoginRequest) =>
    apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, payload),

  register: (payload: RegisterRequest) =>
    apiClient.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, payload),

  logout: () => {
    if (typeof window !== "undefined") {
      Cookies.remove("token");
      Cookies.remove("user");
    }
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return Cookies.get("token") || null;
    }
    return null;
  },

  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      Cookies.set("token", token, { expires: 7, sameSite: 'strict' });
    }
  },

  getUser: (): StoredUser | null => {
    if (typeof window !== "undefined") {
      const userStr = Cookies.get("user");
      if (userStr) {
        try {
          return JSON.parse(userStr) as StoredUser;
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  setUser: (user: StoredUser) => {
    if (typeof window !== "undefined") {
      Cookies.set("user", JSON.stringify(user), { expires: 7, sameSite: 'strict' });
    }
  },

  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },
};
