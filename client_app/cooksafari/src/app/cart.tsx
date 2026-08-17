import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '@/theme';
import { useCartStore } from '@/store/cart-store';
import { useLocationStore } from '@/store/location-store';
import { formatImageUrl } from '@/services/api/product-service';

export default function CartScreen() {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');

  const { currentLocation, openPickerModal } = useLocationStore();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    discountAmount,
    getSubtotal,
    getOriginalSubtotal,
    getSavings,
    getDeliveryFee,
    getPackagingFee,
    getGrandTotal,
  } = useCartStore();

  const itemList = Object.values(items);
  const subtotal = getSubtotal();
  const originalSubtotal = getOriginalSubtotal();
  const savings = getSavings();
  const deliveryFee = getDeliveryFee();
  const packagingFee = getPackagingFee();
  const grandTotal = getGrandTotal();

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponCode;
    if (!code) {
      Alert.alert('Coupon Code Required', 'Please enter a coupon code.');
      return;
    }
    const res = applyCoupon(code);
    Alert.alert(res.success ? 'Coupon Applied! 🎉' : 'Coupon Error', res.message);
    if (res.success) setCouponCode('');
  };

  const handlePlaceOrder = () => {
    Alert.alert(
      'Order Placed Successfully! 🎉',
      `Thank you! Your order of ₹${grandTotal} has been confirmed for 10-minute express delivery to ${currentLocation?.title || 'your location'}.`,
      [
        {
          text: 'Great!',
          onPress: () => {
            clearCart();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  if (itemList.length === 0) {
    return (
      <SafeAreaView style={styles.emptySafeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="basket-outline" size={64} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySub}>
            Looks like you haven't added any fresh groceries to your cart yet.
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            activeOpacity={0.85}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.browseBtnText}>Explore Fresh Products</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.textWhite} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* 1. Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <Text style={styles.headerSub}>{itemList.length} unique items</Text>
        </View>
        <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 2. Delivery Address Banner */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openPickerModal}
          style={styles.addressBanner}
        >
          <View style={styles.addressIconBox}>
            <Ionicons name="location" size={20} color={colors.primary} />
          </View>
          <View style={styles.addressTextCol}>
            <View style={styles.addressTitleRow}>
              <Text style={styles.addressType}>
                Deliver to {currentLocation?.title || 'Selected Location'}
              </Text>
              <Text style={styles.changeAddressText}>CHANGE</Text>
            </View>
            <Text style={styles.addressDetail} numberOfLines={1}>
              {currentLocation?.address || 'Set your delivery location'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 3. Items List Card */}
        <View style={styles.card}>
          <View style={styles.etaHeader}>
            <Ionicons name="flash" size={16} color="#D97706" />
            <Text style={styles.etaTitle}>Delivery in 10 minutes</Text>
            <Text style={styles.etaTag}>SUPERFAST</Text>
          </View>

          {itemList.map(({ product, quantity }) => (
            <View key={product.id} style={styles.itemRow}>
              <Image
                source={{ uri: formatImageUrl(product.imageUrl) }}
                style={styles.itemImg}
                resizeMode="cover"
              />

              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.itemUnit}>{product.unit}</Text>
                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemPrice}>₹{product.price}</Text>
                  {product.originalPrice ? (
                    <Text style={styles.itemOrigPrice}>₹{product.originalPrice}</Text>
                  ) : null}
                </View>
              </View>

              {/* Stepper Counter */}
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  onPress={() => updateQuantity(product.id, quantity - 1)}
                  style={styles.stepBtn}
                >
                  <Ionicons name="remove" size={14} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.stepVal}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(product.id, quantity + 1)}
                  style={styles.stepBtn}
                >
                  <Ionicons name="add" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* 4. Coupons & Offers Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="pricetag" size={18} color={colors.secondary} />
            <Text style={styles.cardTitle}>Coupons & Offers</Text>
          </View>

          {appliedCoupon ? (
            <View style={styles.appliedCouponBox}>
              <View style={styles.appliedLeft}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <View>
                  <Text style={styles.appliedCode}>'{appliedCoupon}' Applied</Text>
                  <Text style={styles.appliedSaved}>You save ₹{discountAmount} on this order</Text>
                </View>
              </View>
              <TouchableOpacity onPress={removeCoupon}>
                <Text style={styles.removeCouponText}>REMOVE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponInputRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter promo code (e.g. COOK30)"
                placeholderTextColor={colors.textMuted}
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => handleApplyCoupon()}
              >
                <Text style={styles.applyBtnText}>APPLY</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Coupons */}
          <View style={styles.quickCouponsRow}>
            <TouchableOpacity
              style={styles.couponPill}
              onPress={() => handleApplyCoupon('COOK30')}
            >
              <Text style={styles.couponPillCode}>COOK30</Text>
              <Text style={styles.couponPillDesc}>30% OFF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.couponPill}
              onPress={() => handleApplyCoupon('FIRST50')}
            >
              <Text style={styles.couponPillCode}>FIRST50</Text>
              <Text style={styles.couponPillDesc}>₹50 OFF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Bill Details Breakdown Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill Details</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {originalSubtotal > subtotal ? (
                <Text style={styles.billOrigValue}>₹{originalSubtotal}</Text>
              ) : null}
              <Text style={styles.billValue}>₹{subtotal}</Text>
            </View>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={[styles.billValue, deliveryFee === 0 && styles.freeText]}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Handling & Packaging</Text>
            <Text style={styles.billValue}>₹{packagingFee}</Text>
          </View>

          {discountAmount > 0 ? (
            <View style={styles.billRow}>
              <Text style={styles.discountLabel}>Coupon Discount</Text>
              <Text style={styles.discountValue}>-₹{discountAmount}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.billGrandRow}>
            <Text style={styles.grandLabel}>To Pay</Text>
            <Text style={styles.grandValue}>₹{grandTotal}</Text>
          </View>

          {savings > 0 ? (
            <View style={styles.savingsBanner}>
              <Ionicons name="sparkles" size={14} color="#065F46" />
              <Text style={styles.savingsBannerText}>
                Total savings of ₹{savings} on this order!
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* 6. Sticky Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomLeft}>
          <Text style={styles.bottomPayLabel}>TOTAL PAYABLE</Text>
          <Text style={styles.bottomPayValue}>₹{grandTotal}</Text>
        </View>

        <TouchableOpacity
          style={styles.placeOrderBtn}
          activeOpacity={0.88}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderBtnText}>Place Order</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.textWhite} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptySafeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  clearBtnText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: typography.fontSize.xs,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 110,
  },
  addressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  addressIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressTextCol: {
    flex: 1,
  },
  addressTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressType: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
  },
  changeAddressText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  addressDetail: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.sm,
  },
  etaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    gap: 6,
    marginBottom: spacing.xs,
  },
  etaTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: '#92400E',
    flex: 1,
  },
  etaTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#D97706',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  itemImg: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSubtle,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemUnit: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  itemOrigPrice: {
    fontSize: 11,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 6,
  },
  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepVal: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
    minWidth: 16,
    textAlign: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  couponInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: typography.fontSize.xs,
  },
  appliedCouponBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  appliedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  appliedCode: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
  },
  appliedSaved: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  removeCouponText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.danger,
  },
  quickCouponsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  couponPill: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  couponPillCode: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  couponPillDesc: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: '700',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  billValue: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  billOrigValue: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  freeText: {
    color: colors.primary,
    fontWeight: '800',
  },
  discountLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: '700',
  },
  discountValue: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.xs,
  },
  billGrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  grandValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    gap: 6,
    marginTop: spacing.xs,
  },
  savingsBannerText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: '#065F46',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  bottomLeft: {
    flexDirection: 'column',
  },
  bottomPayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  bottomPayValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  placeOrderBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: 8,
    elevation: 3,
  },
  placeOrderBtnText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.md,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  emptyIconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  browseBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: 8,
  },
  browseBtnText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: typography.fontSize.sm,
  },
});
