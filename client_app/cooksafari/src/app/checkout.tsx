import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '@/theme';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useLocationStore } from '@/store/location-store';
import { formatImageUrl } from '@/services/api/product-service';
import { clientOrderService } from '@/services/api/order-service';

export default function CheckoutScreen() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { user, isAuthenticated, openLoginModal } = useAuthStore();
  const { currentLocation, openPickerModal } = useLocationStore();
  const {
    items,
    appliedCoupon,
    discountAmount,
    getSubtotal,
    getDeliveryFee,
    getPackagingFee,
    getGrandTotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  const itemList = Object.values(items);
  const grandTotal = getGrandTotal();

  if (itemList.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
        </View>
        <View style={styles.emptyBody}>
          <Ionicons name="cart-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Cart is Empty</Text>
          <Text style={styles.emptySub}>Add items to cart before proceeding to checkout.</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.browseBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    try {
      setIsPlacingOrder(true);

      const requestPayload = {
        couponCode: appliedCoupon || undefined,
        paymentMethod: paymentMethod,
        shippingAddress: {
          street: currentLocation?.address || currentLocation?.title || 'Main Street, Sector 15',
          city: 'City',
          state: 'State',
          country: 'India',
          zipCode: currentLocation?.pincode || '110001',
          phone: user?.phoneNumber || '9876543210',
        },
        notes: `Placed via Mobile App (${paymentMethod})`,
      };

      const res = await clientOrderService.createOrder(requestPayload);

      if (res.success && res.data) {
        clearCart();
        Alert.alert(
          '🎉 Order Placed Successfully!',
          `Order #${res.data.orderNumber} has been placed.\nTotal: ₹${res.data.totalAmount}\nDelivery in 10-15 mins.`,
          [
            {
              text: 'View Orders',
              onPress: () => router.replace('/(tabs)/orders'),
            },
          ]
        );
      } else {
        Alert.alert('Order Placement Failed', res.message || 'Could not place order. Please try again.');
      }
    } catch (err: any) {
      Alert.alert('Checkout Error', err?.message || 'Failed to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Checkout</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. Delivery Address Banner */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={openPickerModal}>
              <Text style={styles.changeText}>CHANGE</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.addressName}>
            {currentLocation?.title || user?.fullName || 'Delivery Address'}
          </Text>
          <Text style={styles.addressDetail}>
            {currentLocation?.address || 'Set delivery location using map'}
          </Text>

          {currentLocation && !currentLocation.isServiceable ? (
            <View style={styles.unserviceableAlert}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={styles.unserviceableTitle}>Location Unserviceable</Text>
                <Text style={styles.unserviceableSub}>
                  {currentLocation.message || `Delivery is not available at pincode ${currentLocation.pincode || ''}. Please tap CHANGE.`}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* 2. Order Summary Items */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="bag-handle" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Order Summary ({itemList.length} items)</Text>
          </View>

          {itemList.map(({ product, quantity }) => {
            const hasProductDiscount = !!(product.originalPrice && product.originalPrice > product.price);
            return (
              <View key={product.id} style={styles.itemRow}>
                <Image source={{ uri: formatImageUrl(product.imageUrl) }} style={styles.itemImg} />
                <View style={styles.itemMeta}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.itemSub}>
                    ₹{product.price} / {product.unit}
                    {hasProductDiscount && (
                      <Text style={styles.productDiscountBadge}> • Product Discount</Text>
                    )}
                  </Text>
                </View>

                {/* Quantity Stepper */}
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(product.id, quantity - 1)}
                    style={styles.stepBtn}
                  >
                    <Ionicons name="remove" size={12} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.stepVal}>{quantity}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(product.id, quantity + 1)}
                    style={styles.stepBtn}
                  >
                    <Ionicons name="add" size={12} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemPrice}>₹{product.price * quantity}</Text>

                {/* Remove Item */}
                <TouchableOpacity
                  onPress={() => removeItem(product.id)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* 3. Applied Coupon (if active) */}
        {appliedCoupon ? (
          <View style={styles.card}>
            <View style={styles.couponRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <View style={styles.couponMeta}>
                <Text style={styles.couponCode}>Coupon '{appliedCoupon}' Applied</Text>
                <Text style={styles.couponSaveText}>
                  You save ₹{discountAmount} on order placement!
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* 4. Payment Method Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentSelected]}
            onPress={() => setPaymentMethod('COD')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={paymentMethod === 'COD' ? 'radio-button-on' : 'radio-button-off'}
              size={18}
              color={paymentMethod === 'COD' ? colors.primary : colors.textMuted}
            />
            <View style={styles.paymentMeta}>
              <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
              <Text style={styles.paymentSub}>Pay cash or UPI upon 10-min delivery</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'ONLINE' && styles.paymentSelected]}
            onPress={() => setPaymentMethod('ONLINE')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={paymentMethod === 'ONLINE' ? 'radio-button-on' : 'radio-button-off'}
              size={18}
              color={paymentMethod === 'ONLINE' ? colors.primary : colors.textMuted}
            />
            <View style={styles.paymentMeta}>
              <Text style={styles.paymentTitle}>Pay Online (UPI / Card / NetBanking)</Text>
              <Text style={styles.paymentSub}>Instant digital payment</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 5. Bill Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill Breakdown</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Subtotal</Text>
            <Text style={styles.billVal}>₹{getSubtotal().toFixed(2)}</Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.discountLabel}>Coupon Discount ({appliedCoupon})</Text>
              <Text style={styles.discountVal}>-₹{discountAmount}</Text>
            </View>
          )}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={[styles.billVal, getDeliveryFee() === 0 && styles.freeText]}>
              {getDeliveryFee() === 0 ? 'FREE' : `₹${getDeliveryFee()}`}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Packaging Charge</Text>
            <Text style={styles.billVal}>₹{getPackagingFee()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Total Amount</Text>
            <Text style={styles.grandVal}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Place Order CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPayLabel}>TOTAL TO PAY</Text>
          <Text style={styles.bottomPayVal}>₹{grandTotal}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.placeOrderBtn,
            (isPlacingOrder || (currentLocation && !currentLocation.isServiceable)) && styles.disabledBtn,
          ]}
          activeOpacity={0.88}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder || (!!currentLocation && !currentLocation.isServiceable)}
        >
          {isPlacingOrder ? (
            <ActivityIndicator size="small" color={colors.textWhite} />
          ) : (
            <>
              <Text style={styles.placeOrderBtnText}>
                {currentLocation && !currentLocation.isServiceable
                  ? 'LOCATION UNSERVICEABLE'
                  : 'CONFIRM ORDER'}
              </Text>
              {currentLocation?.isServiceable !== false && (
                <Ionicons name="checkmark-circle" size={18} color={colors.textWhite} />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: spacing.md,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptyBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySub: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  browseBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  browseBtnText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: typography.fontSize.sm,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.xs,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
    marginLeft: 6,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  addressName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addressDetail: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
    gap: spacing.sm,
  },
  itemImg: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSubtle,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemSub: {
    fontSize: 10,
    color: colors.textMuted,
  },
  productDiscountBadge: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 10,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 4,
  },
  stepBtn: {
    padding: 2,
  },
  stepVal: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
    minWidth: 14,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 2,
  },
  itemPrice: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  couponMeta: {
    flex: 1,
  },
  couponCode: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.primary,
  },
  couponSaveText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  paymentSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  paymentMeta: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  paymentSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  billLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  billVal: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  freeText: {
    color: '#059669',
    fontWeight: '800',
  },
  discountLabel: {
    fontSize: typography.fontSize.xs,
    color: '#059669',
    fontWeight: '700',
  },
  discountVal: {
    fontSize: typography.fontSize.xs,
    color: '#059669',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.xs,
  },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  grandLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  grandVal: {
    fontSize: typography.fontSize.lg,
    fontWeight: '900',
    color: colors.textPrimary,
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
    shadowRadius: 8,
  },
  bottomPayLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  bottomPayVal: {
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
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  disabledBtn: {
    backgroundColor: '#9CA3AF',
    opacity: 0.85,
  },
  unserviceableAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  unserviceableTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: '#991B1B',
  },
  unserviceableSub: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 1,
  },
  placeOrderBtnText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: typography.fontSize.md,
  },
});
