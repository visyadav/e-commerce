import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '@/theme';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  imageUrl: string;
  badge?: string;
  discountPercentage?: string;
  rating?: number;
  isVeg?: boolean;
  deliveryTime?: string;
  stockQuantity?: number;
  onPress?: () => void;
  onAddToCart?: (id: string, quantity: number) => void;
  width?: number;
  style?: StyleProp<ViewStyle>;
}

import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';

import { useRouter } from 'expo-router';

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  unit,
  imageUrl,
  badge,
  discountPercentage,
  rating = 4.8,
  isVeg = true,
  deliveryTime = '10 MINS',
  stockQuantity,
  onPress,
  onAddToCart,
  width,
  style,
}: ProductCardProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fallbackImage = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80';

  const { getItemQuantity, addItem, updateQuantity } = useCartStore();
  const { isAuthenticated, openLoginModal } = useAuthStore();
  const quantity = getItemQuantity(id);
  const isOutOfStock = stockQuantity !== undefined && stockQuantity <= 0;

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/product/${id}`);
    }
  };

  // Calculate discount percentage automatically if originalPrice is passed
  const computedDiscount = discountPercentage || (
    originalPrice && originalPrice > price
      ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`
      : null
  );

  const handleIncrement = () => {
    if (isOutOfStock) return;
    if (!isAuthenticated) {
      openLoginModal({
        product: { id, name, price, originalPrice, unit, imageUrl, isVeg, stockQuantity },
        quantity: 1,
      });
      return;
    }
    const added = addItem({ id, name, price, originalPrice, unit, imageUrl, isVeg, stockQuantity }, 1);
    if (added) {
      onAddToCart?.(id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    updateQuantity(id, quantity - 1);
    onAddToCart?.(id, Math.max(0, quantity - 1));
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handleCardPress}
      style={[styles.card, width ? { width } : null, isOutOfStock && styles.cardOutOfStock, style]}
    >
      {/* 1. Top Image Canvas */}
      <View style={styles.imageCanvas}>
        {/* Top Badges Row */}
        <View style={styles.topBadgesRow}>
          {isOutOfStock ? (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockBadgeText}>Currently Not Available</Text>
            </View>
          ) : computedDiscount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{computedDiscount}</Text>
            </View>
          ) : badge ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{badge}</Text>
            </View>
          ) : <View />}

          {/* Favorite Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsFavorite(!isFavorite)}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={16}
              color={isFavorite ? colors.danger : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Product Image Container with Grayscale/Black&White Effect */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageError || !imageUrl ? fallbackImage : imageUrl }}
            style={[styles.productImage, isOutOfStock && styles.productImageOutOfStock]}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
          {isOutOfStock && <View style={styles.blackAndWhiteOverlay} />}
        </View>

        {/* Delivery ETA Pill */}
        {!isOutOfStock && deliveryTime ? (
          <View style={styles.etaPill}>
            <Ionicons name="flash" size={10} color="#D97706" />
            <Text style={styles.etaText}>{deliveryTime}</Text>
          </View>
        ) : null}
      </View>

      {/* 2. Content Details */}
      <View style={styles.contentContainer}>
        {/* Meta Row: Veg Icon + Unit + Rating */}
        <View style={styles.metaRow}>
          <View style={styles.leftMeta}>
            {isVeg && (
              <View style={styles.vegSquare}>
                <View style={styles.vegCircle} />
              </View>
            )}
            <Text style={styles.unitText}>{unit}</Text>
          </View>

          {rating ? (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color="#F59E0B" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          ) : null}
        </View>

        {/* Product Title */}
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>

        {/* Price & Add Stepper Row */}
        <View style={styles.actionRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>₹{price}</Text>
            {originalPrice && originalPrice > price ? (
              <Text style={styles.originalPrice}>₹{originalPrice}</Text>
            ) : null}
          </View>

          {/* ADD / Counter Stepper */}
          {isOutOfStock ? (
            <View style={styles.disabledAddButton}>
              <Text style={styles.disabledAddText}>OUT OF STOCK</Text>
            </View>
          ) : quantity === 0 ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleIncrement}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>ADD</Text>
              <Ionicons name="add" size={15} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.stepperContainer}>
              <TouchableOpacity onPress={handleDecrement} style={styles.stepperBtn}>
                <Ionicons name="remove" size={13} color={colors.textWhite} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{quantity}</Text>
              <TouchableOpacity onPress={handleIncrement} style={styles.stepperBtn}>
                <Ionicons name="add" size={13} color={colors.textWhite} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardOutOfStock: {
    opacity: 0.8,
  },
  imageCanvas: {
    width: '100%',
    height: 130,
    backgroundColor: colors.surfaceSubtle,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xs,
  },
  topBadgesRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  outOfStockBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  outOfStockBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  discountBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  categoryBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  favoriteButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '82%',
    height: '82%',
    borderRadius: borderRadius.sm,
  },
  productImageOutOfStock: {
    opacity: 0.4,
  },
  blackAndWhiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(100, 116, 139, 0.25)',
    borderRadius: borderRadius.sm,
  },
  disabledAddButton: {
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  disabledAddText: {
    color: '#64748B',
    fontWeight: '800',
    fontSize: 10,
  },
  etaPill: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  etaText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
  },
  contentContainer: {
    padding: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  leftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vegSquare: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  vegCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  unitText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  productName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18,
    height: 36,
    marginBottom: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currentPrice: {
    fontSize: typography.fontSize.md,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  originalPrice: {
    fontSize: 11,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  addButtonText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 4,
    paddingVertical: 3,
    gap: 6,
  },
  stepperBtn: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: 12,
    minWidth: 14,
    textAlign: 'center',
  },
});

export default ProductCard;
