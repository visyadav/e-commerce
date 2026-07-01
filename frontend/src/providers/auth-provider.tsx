"use client";

import { useReducer, useEffect, useCallback, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/src/services/auth/auth-service";
import {
  AuthContext,
  authReducer,
  initialAuthState,
  type AuthContextType,
} from "@/src/store/auth-store";
import { ROUTES } from "@/src/constants/routes";
import { StoredUser } from "@/src/types/auth";

interface AuthProviderProps {
  children: ReactNode;
}

function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof decoded.exp === "number") {
      return decoded.exp * 1000;
    }
  } catch {
    // malformed token
  }
  return null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const router = useRouter();
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExpiry = useCallback(() => {
    authService.logout();
    dispatch({ type: "LOGOUT" });
    router.push(ROUTES.LOGIN);
  }, [router]);

  const scheduleExpiryTimer = useCallback(
    (token: string) => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }

      const expiry = getTokenExpiry(token);
      if (!expiry) return;

      const msUntilExpiry = expiry - Date.now();

      if (msUntilExpiry <= 0) {
        handleExpiry();
        return;
      }

      expiryTimerRef.current = setTimeout(() => {
        handleExpiry();
      }, msUntilExpiry);
    },
    [handleExpiry]
  );

  useEffect(() => {
    const token = authService.getToken();
    const user = authService.getUser();

    if (token) {
      const expiry = getTokenExpiry(token);
      if (expiry !== null && expiry <= Date.now()) {
        authService.logout();
        dispatch({ type: "INIT_AUTH", payload: { user: null, token: null } });
        router.push(ROUTES.LOGIN);
        return;
      }
      scheduleExpiryTimer(token);
    }

    dispatch({ type: "INIT_AUTH", payload: { user, token } });

    return () => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }
    };
  }, [scheduleExpiryTimer, router]);

  useEffect(() => {
    if (state.token) {
      scheduleExpiryTimer(state.token);
    } else {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }
    }
  }, [state.token, scheduleExpiryTimer]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const data = await authService.login({ email, password });

      if (data.accessToken) {
        authService.setToken(data.accessToken);
        dispatch({ type: "SET_TOKEN", payload: data.accessToken });
      }

      const user: StoredUser = {
        email: data.email,
        fullName: data.fullName,
        roles: data.roles || [],
        themeColor: data.themeColor || "default",
      };
      authService.setUser(user);
      dispatch({ type: "SET_USER", payload: user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const register = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      phoneNumber?: string
    ) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });

        const data = await authService.register({
          firstName,
          lastName,
          email,
          password,
          phoneNumber,
        });

        if (data.accessToken) {
          authService.setToken(data.accessToken);
          dispatch({ type: "SET_TOKEN", payload: data.accessToken });
        }

        const user: StoredUser = {
          email: data.email,
          fullName: data.fullName,
          roles: data.roles || [],
          themeColor: data.themeColor || "default",
        };
        authService.setUser(user);
        dispatch({ type: "SET_USER", payload: user });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Registration failed";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    []
  );

  const updateUser = useCallback((updates: Partial<StoredUser>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...updates } as StoredUser;
      authService.setUser(updatedUser);
      dispatch({ type: "SET_USER", payload: updatedUser });
    }
  }, [state.user]);

  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: "LOGOUT" });
  }, []);

  const contextValue: AuthContextType = {
    state,
    dispatch,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!state.token,
    initialized: state.initialized,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
