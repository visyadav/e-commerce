import { createContext } from "react";
import type { StoredUser } from "@/src/types/auth";

export interface AuthState {
  user: StoredUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
}

export type AuthAction =
  | { type: "SET_USER"; payload: StoredUser }
  | { type: "SET_TOKEN"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOGOUT" }
  | { type: "INIT_AUTH"; payload: { user: StoredUser | null; token: string | null } };

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  initialized: false,
};

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, error: null };
    case "SET_TOKEN":
      return { ...state, token: action.payload, error: null };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "LOGOUT":
      return { ...state, user: null, token: null, error: null };
    case "INIT_AUTH":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        initialized: true,
      };
    default:
      return state;
  }
};

export interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber?: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<StoredUser>) => void;
  isAuthenticated: boolean;
  initialized: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
