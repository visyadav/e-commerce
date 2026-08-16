import { Platform } from 'react-native';

// Standard Android emulator uses 10.0.2.2 to connect to host machine localhost
// Physical devices or iOS simulators use localhost or local IP
const LOCAL_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || `http://${LOCAL_HOST}:5185`,
  API_VERSION: '/api/v1',
  TIMEOUT: 15000,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (id: string) => `/products/${id}`,
    CATEGORIES: '/categories',
    FEATURED: '/products/featured',
  },
  CART: {
    GET: '/cart',
    ADD: '/cart/items',
    REMOVE: (itemId: string) => `/cart/items/${itemId}`,
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAILS: (id: string) => `/orders/${id}`,
  },
};
