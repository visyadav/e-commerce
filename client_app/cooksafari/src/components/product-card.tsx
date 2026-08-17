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
  onPress?: () => void;
  width?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  unit,
  imageUrl,
  badge,
  discountPercentage,
  rating,
  onPress,
  width,
  style,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 0 ? q - 1 : 0));

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[styles.card, width ? { width } : null, style]}
    >
      {/* Top Image Canvas Container */}
      <View style={styles.imageCanvas}>
        {/* Discount / Category Badge */}
        {discountPercentage ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercentage}</Text>
          </View>
        ) : badge ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{badge}</Text>
          </View>
        ) : null}

        {/* Favorite Heart Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsFavorite(!isFavorite)}
          style={styles.favoriteButton}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? colors.danger : colors.textMuted}
          />
        </TouchableOpacity>

        {/* Product Image */}
        <Image
          source={{ uri: imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>

      {/* Content Details */}
      <View style={styles.contentContainer}>
        {/* Rating & Unit Row */}
        <View style={styles.metaRow}>
          <Text style={styles.unitText}>{unit}</Text>
          {rating ? (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color="#F59E0B" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          ) : null}
        </View>

        {/* Product Name */}
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>

        {/* Price & Quantity Add Action Row */}
        <View style={styles.actionRow}>
          {/* Price Container */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>₹{price}</Text>
              {originalPrice ? (
                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
              ) : null}
            </View>
          </View>

          {/* Interactive Stepper / ADD Button */}
          {quantity === 0 ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleIncrement}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>ADD</Text>
              <Ionicons name="add" size={16} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.stepperContainer}>
              <TouchableOpacity onPress={handleDecrement} style={styles.stepperBtn}>
                <Ionicons name="remove" size={14} color={colors.textWhite} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{quantity}</Text>
              <TouchableOpacity onPress={handleIncrement} style={styles.stepperBtn}>
                <Ionicons name="add" size={14} color={colors.textWhite} />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  imageCanvas: {
    width: '100%',
    height: 125,
    backgroundColor: colors.surfaceSubtle,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '85%',
    height: '85%',
    borderRadius: borderRadius.md,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    zIndex: 5,
  },
  discountText: {
    color: colors.textWhite,
    fontSize: 10,
    fontWeight: '800',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    zIndex: 5,
  },
  categoryBadgeText: {
    color: colors.textWhite,
    fontSize: 9,
    fontWeight: '800',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contentContainer: {
    padding: spacing.md,
    justifyContent: 'space-between',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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
    gap: 3,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  productName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: spacing.sm,
    height: 36,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceRow: {
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
    fontSize: typography.fontSize.xs,
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
    paddingVertical: 4,
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
    fontSize: 13,
    minWidth: 16,
    textAlign: 'center',
  },
});

export default ProductCard;
