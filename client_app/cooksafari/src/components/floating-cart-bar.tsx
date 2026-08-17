import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '@/theme';
import { useCartStore } from '@/store/cart-store';

export function FloatingCartBar() {
  const router = useRouter();
  const { getTotalItems, getGrandTotal, getSavings } = useCartStore();

  const totalItems = getTotalItems();
  const grandTotal = getGrandTotal();
  const savings = getSavings();

  if (totalItems === 0) return null;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/cart')}
        style={styles.cartBar}
      >
        {/* Left Side: Items Count & Total */}
        <View style={styles.leftCol}>
          <View style={styles.countBadge}>
            <Ionicons name="basket" size={16} color={colors.textWhite} />
            <Text style={styles.countText}>{totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.totalPrice}>₹{grandTotal}</Text>
            {savings > 0 ? (
              <Text style={styles.savingsText}>Saved ₹{savings}</Text>
            ) : null}
          </View>
        </View>

        {/* Right Side: View Cart CTA */}
        <View style={styles.rightCol}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.textWhite} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 85, // Positioned right above bottom navigation tabs
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
  },
  cartBar: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  countText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'column',
  },
  totalPrice: {
    color: colors.textWhite,
    fontSize: typography.fontSize.md,
    fontWeight: '800',
  },
  savingsText: {
    color: '#FEF08A', // Light yellow accent for savings
    fontSize: 10,
    fontWeight: '700',
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  viewCartText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
  },
});

export default FloatingCartBar;
