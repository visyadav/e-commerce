# AGENTS.md - CookSafari React Native E-Commerce App

Guidelines, architectural rules, and project context for AI agents working on `cooksafari_app`.

---

## 🚀 Project Overview

`cooksafari_app` is a **production-ready, cross-platform mobile application** built using **React Native** and **Expo**. It serves as the primary mobile storefront for the CookSafari E-Commerce platform, targeting **both Android and iOS devices** from a single TypeScript codebase.

- **Framework**: React Native + Expo (v57+)
- **Navigation**: Expo Router (File-based routing)
- **Language**: TypeScript (Strict Mode)
- **State Management**: React Context + Custom Hooks
- **Backend API**: ASP.NET Core Web API (`ECommerce.Api`)

---

## 📁 Production Directory Structure

Maintain a clean, modular, domain-driven folder hierarchy:

```text
cooksafari_app/
├── AGENTS.md                    # Agent guidelines and architectural documentation
├── app.json                     # Expo configuration
├── package.json                 # Dependencies and npm scripts
├── tsconfig.json                # TypeScript compiler configuration
├── app/                         # Expo Router pages (Navigation Stack & Tabs)
│   ├── (auth)/                  # Auth screens (Login, Register, Forgot Password)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                  # Main Bottom Tab Navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Home Screen (Banners, Categories, Featured)
│   │   ├── catalog.tsx          # Catalog & Search
│   │   ├── cart.tsx             # Shopping Cart
│   │   ├── wishlist.tsx         # Wishlist / Saved Items
│   │   └── profile.tsx          # User Profile & Settings
│   ├── product/
│   │   └── [id].tsx             # Product Details Screen
│   ├── checkout/                # Checkout & Payment Flow
│   │   ├── index.tsx
│   │   └── confirmation.tsx
│   ├── orders/                  # Order History & Tracking
│   │   ├── index.tsx
│   │   └── [id].tsx
│   └── _layout.tsx              # Root Layout & Global Context Providers
└── src/
    ├── api/                     # Typed API Client & Service endpoints
    │   ├── client.ts            # Axios instance with JWT interceptors
    │   ├── auth.ts              # Authentication endpoints
    │   ├── products.ts          # Catalog & Product endpoints
    │   ├── cart.ts              # Shopping Cart endpoints
    │   └── orders.ts            # Orders & Checkout endpoints
    ├── components/              # Modular UI Components
    │   ├── common/              # Buttons, Inputs, Cards, Badges, Loaders
    │   ├── product/             # ProductCard, ProductGrid, RatingStars, PriceTag
    │   ├── cart/                # CartItem, OrderSummary, CheckoutBar
    │   └── layout/              # Header, SafeScreen, SearchBar
    ├── context/                 # Global React Context State Managers
    │   ├── AuthContext.tsx      # Authentication state & JWT tokens
    │   ├── CartContext.tsx      # Cart items, item count, total price
    │   └── ThemeContext.tsx     # Light/Dark mode tokens & colors
    ├── hooks/                   # Custom Reusable React Hooks
    │   ├── useAuth.ts
    │   ├── useCart.ts
    │   ├── useProducts.ts
    │   └── useDebounce.ts
    ├── types/                   # TypeScript DTO Models & Interfaces
    │   ├── auth.ts              # User, LoginRequest, AuthResponse
    │   ├── product.ts           # Product, Category, Brand, Review
    │   ├── cart.ts              # CartItem, AddToCartDto
    │   └── order.ts             # Order, OrderItem, PaymentDetails
    ├── constants/               # App Constants & Theme Tokens
    │   ├── config.ts            # API_BASE_URL, Timeout
    │   ├── colors.ts            # Color palette & Dark/Light mode tokens
    │   └── storage.ts           # SecureStore / AsyncStorage Keys
    └── utils/                   # Helper Functions
        ├── formatters.ts        # Currency, Date, and Price formatters
        ├── storage.ts           # Secure Storage wrapper for Auth Tokens
        └── validators.ts        # Form validation schemas
```

---

## 📜 Development Guidelines & Coding Rules

### 1. Cross-Platform First (Android + iOS)
- Ensure all screens and components render correctly on **both iOS and Android**.
- Use `react-native-safe-area-context` (`SafeAreaView` or `useSafeAreaInsets`) to handle notch, status bar, and home bar spacing properly.
- Avoid platform-specific code unless necessary. Use `Platform.OS === 'ios'` or `Platform.OS === 'android'` sparingly when native styling differs.

### 2. Strict Type Safety
- **No `any` types**: Always define explicit TypeScript interfaces/types in `src/types/`.
- All API request & response payloads must match the `ECommerce.Api` DTO models.

### 3. Component Architecture
- Separate UI rendering from data fetching and state logic. Use custom hooks in `src/hooks/` for async business logic.
- Keep components focused and single-responsibility.
- Use `React.memo` or `useCallback` when passing callbacks to large lists (`FlatList` / `FlashList`).

### 4. API & Authentication Flow
- All HTTP requests go through `src/api/client.ts`.
- Automatically attach JWT Bearer Token from secure storage on outgoing requests.
- Handle token expiration (401 Unauthorized) gracefully via refresh token logic in Axios interceptors.

---

## 🛠️ Verification & Useful Commands

When making changes to `cooksafari_app`, always verify using the following commands:

```bash
# Navigate to project
cd cooksafari_app

# Run TypeScript Type Checker (Must pass with 0 errors)
npx tsc --noEmit

# Run Development Server
npx expo start

# Run on Android Emulator
npm run android

# Run on iOS Simulator (macOS only)
npm run ios
```
