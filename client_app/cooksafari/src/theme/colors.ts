export const colors = {
  // Brand Colors (Next-Gen Fresh Grocery Aesthetics)
  primary: '#10B981',        // Emerald Green Primary Accent
  primaryDark: '#047857',
  primaryLight: '#ECFDF5',   // Soft Mint Tint
  
  secondary: '#FF6B00',      // Sunset Orange Accent (CTA & Sale Badges)
  secondaryLight: '#FFF4ED',
  
  accent: '#6366F1',         // Electric Indigo
  accentLight: '#EEF2FF',

  // Background & Surfaces
  background: '#F8FAFC',     // Clean Ultra-Light Slate
  surface: '#FFFFFF',        // Pure White Surface
  surfaceSubtle: '#F1F5F9',   // Light Muted Grey Surface
  cardBorder: '#E2E8F0',
  border: '#E2E8F0',
  shadow: '#000000',

  // Text Colors
  textPrimary: '#0F172A',    // Deep Slate Heading
  textSecondary: '#475569',  // Medium Slate Text
  textMuted: '#94A3B8',      // Muted Subtext
  textWhite: '#FFFFFF',
  
  // Status Colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',

  // Bottom Navigation
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#10B981',
  tabBarInactive: '#94A3B8',
  tabBarBorder: '#E2E8F0',
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    heading: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
};

export default theme;
