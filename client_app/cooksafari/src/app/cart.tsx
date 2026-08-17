import React, { useState, useEffect } from 'react';
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
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '@/theme';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useLocationStore } from '@/store/location-store';
import { formatImageUrl } from '@/services/api/product-service';
import { clientCouponService, ClientCouponDto } from '@/services/api/coupon-service';

export default function CartScreen() {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupons, setActiveCoupons] = useState<ClientCouponDto[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuthStore();
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
    syncWithServer,
  } = useCartStore();

  const fetchActiveCoupons = async () => {
    try {
      const res = await clientCouponService.getActiveCoupons();
      if (res.success && res.data) {
        setActiveCoupons(res.data);
      }
    } catch {
      setActiveCoupons([]);
    }
  };

  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([syncWithServer(), fetchActiveCoupons()]);
    } catch (err) {
      console.warn('Error refreshing cart:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const itemList = Object.values(items);

  // Separate into Standard Items (Coupon Eligible) vs Special Product Discount Items
  const standardItems = itemList.filter(
    (i) => !i.product.originalPrice || i.product.originalPrice <= i.product.price
  );
  const discountItems = itemList.filter(
    (i) => i.product.originalPrice && i.product.originalPrice > i.product.price
  );

  const standardSubtotal = standardItems.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  const discountSubtotal = discountItems.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  const directProductSavings = discountItems.reduce(
    (sum, i) => sum + ((i.product.originalPrice || i.product.price) - i.product.price) * i.quantity,
    0
  );

  const subtotal = getSubtotal();
  const originalSubtotal = getOriginalSubtotal();
  const savings = getSavings();
  const deliveryFee = getDeliveryFee();
  const packagingFee = getPackagingFee();
  const grandTotal = getGrandTotal();

  const handleApplyCoupon = async (codeToUse?: string) => {
    const code = codeToUse || couponCode;
    if (!code.trim()) {
      Alert.alert('Required', 'Please enter a coupon code.');
      return;
    }

    const res = await applyCoupon(code, user?.id);
    if (res.success) {
      Alert.alert('🎉 Success', res.message);
      setCouponCode('');
    } else {
      Alert.alert('Coupon Error', res.message);
    }
  };

  const handlePlaceOrder = () => {
    if (itemList.length === 0) {
      Alert.alert('Empty Cart', 'Please add products to your cart before ordering.');
      return;
    }
    if (currentLocation && !currentLocation.isServiceable) {
      Alert.alert(
        'Location Unserviceable ⚠️',
        currentLocation.message || 'Delivery is not available at this pincode. Please tap CHANGE to select a serviceable delivery address.',
        [
          { text: 'CHANGE ADDRESS', onPress: openPickerModal },
          { text: 'OK', style: 'cancel' },
        ]
      );
      return;
    }
    router.push('/checkout');
  };

  if (itemList.length === 0) {
    return (
      <SafeAreaView style={styles.emptySafeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <View style={styles.emptyHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.emptyHeaderTitle}>Your Cart</Text>
        </View>

        <View style={styles.emptyBody}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&w=600&q=80' }}
            style={styles.emptyImg}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySub}>
            Explore our fresh dairy products, paneer, and groceries to add items to your cart.
          </Text>

          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.browseBtnText}>Explore Products</Text>
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

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
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

        {/* Location Serviceability Alert Banner */}
        {currentLocation && !currentLocation.isServiceable ? (
          <View style={styles.unserviceableAlert}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <View style={{ flex: 1 }}>
              <Text style={styles.unserviceableTitle}>Location Unserviceable</Text>
              <Text style={styles.unserviceableSub}>
                {currentLocation.message || `Delivery is not available at pincode ${currentLocation.pincode || ''}. Please tap CHANGE to select a serviceable location.`}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.etaCard}>
            <Ionicons name="flash" size={16} color="#D97706" />
            <Text style={styles.etaTitle}>Delivery in 10 minutes</Text>
            <Text style={styles.etaTag}>SUPERFAST</Text>
          </View>
        )}

        {/* 3A. Standard Products Section (Eligible for Cart Coupons) */}
        {standardItems.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.headerIconBoxGreen}>
                <Ionicons name="shield-checkmark" size={14} color="#059669" />
              </View>
              <Text style={styles.sectionHeaderTitle}>Standard Products</Text>
              <Text style={styles.couponEligibleBadge}>Coupon Eligible</Text>
            </View>

            {standardItems.map(({ product, quantity }) => (
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
        )}

        {/* 3B. Product Discount Items Section (Excluded from Coupons) */}
        {discountItems.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.headerIconBoxOrange}>
                <Ionicons name="flame" size={14} color="#D97706" />
              </View>
              <Text style={styles.sectionHeaderTitle}>Special Offer Products</Text>
              <Text style={styles.directOfferBadge}>Product Discount Active</Text>
            </View>
            <Text style={styles.sectionSubNote}>
              Direct product discount applied — cart coupons do not apply to these items.
            </Text>

            {discountItems.map(({ product, quantity }) => {
              const perItemSavings = (product.originalPrice || product.price) - product.price;
              return (
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
                      <Text style={styles.itemOrigPrice}>₹{product.originalPrice}</Text>
                    </View>
                    <Text style={styles.itemSavingsTag}>
                      Save ₹{perItemSavings * quantity} ({Math.round((perItemSavings / product.originalPrice!) * 100)}% OFF)
                    </Text>
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
              );
            })}
          </View>
        )}

        {/* 4. Coupons & Offers Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="pricetag" size={18} color={colors.secondary} />
            <Text style={styles.cardTitle}>Coupons & Promo Codes</Text>
          </View>
          <Text style={styles.couponInfoNote}>
            ℹ️ Coupons apply on standard non-discounted subtotal (₹{standardSubtotal.toFixed(2)})
          </Text>

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
            {activeCoupons.length > 0 ? (
              activeCoupons.slice(0, 3).map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.couponPill}
                  onPress={() => handleApplyCoupon(c.code)}
                >
                  <Text style={styles.couponPillCode}>{c.code}</Text>
                  <Text style={styles.couponPillDesc}>
                    {c.discountPercentage}% OFF{c.productName ? ` (${c.productName})` : ''}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <>
                <TouchableOpacity
                  style={styles.couponPill}
                  onPress={() => handleApplyCoupon('COOK30')}
                >
                  <Text style={styles.couponPillCode}>COOK30</Text>
                  <Text style={styles.couponPillDesc}>30% OFF</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.couponPill}
                  onPress={() => handleApplyCoupon('WELCOME50')}
                >
                  <Text style={styles.couponPillCode}>WELCOME50</Text>
                  <Text style={styles.couponPillDesc}>10% OFF</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* 5. Bill Details Breakdown Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill Details</Text>

          {standardItems.length > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Standard Products Subtotal</Text>
              <Text style={styles.billValue}>₹{standardSubtotal.toFixed(2)}</Text>
            </View>
          )}

          {discountItems.length > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Special Offer Items Subtotal</Text>
              <Text style={styles.billValue}>₹{discountSubtotal.toFixed(2)}</Text>
            </View>
          )}

          {directProductSavings > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.discountLabel}>Direct Product Savings</Text>
              <Text style={styles.discountValue}>-₹{directProductSavings.toFixed(2)}</Text>
            </View>
          )}

          {discountAmount > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.discountLabel}>Coupon Discount ({appliedCoupon})</Text>
              <Text style={styles.discountValue}>-₹{discountAmount}</Text>
            </View>
          )}

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
          style={[
            styles.placeOrderBtn,
            currentLocation && !currentLocation.isServiceable && styles.disabledBtn,
          ]}
          activeOpacity={0.88}
          onPress={handlePlaceOrder}
          disabled={!!currentLocation && !currentLocation.isServiceable}
        >
          <Text style={styles.placeOrderBtnText}>
            {currentLocation && !currentLocation.isServiceable
              ? 'LOCATION UNSERVICEABLE'
              : 'PROCEED TO CHECKOUT'}
          </Text>
          {currentLocation?.isServiceable !== false && (
            <Ionicons name="arrow-forward" size={18} color={colors.textWhite} />
          )}
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
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backBtn: {
    padding: spacing.xs,
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
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearBtnText: {
    fontSize: typography.fontSize.xs,
    color: colors.danger,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  addressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.md,
  },
  addressIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
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
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  changeAddressText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  addressDetail: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  etaTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },
  etaTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  headerIconBoxGreen: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconBoxOrange: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
  sectionSubNote: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  couponEligibleBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  directOfferBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
    gap: spacing.md,
  },
  itemImg: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSubtle,
  },
  itemDetails: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemUnit: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  itemPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  itemOrigPrice: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  itemSavingsTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 6,
  },
  stepBtn: {
    padding: 2,
  },
  stepVal: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    minWidth: 14,
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
  couponInfoNote: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  appliedCouponBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  appliedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  appliedCode: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.primary,
  },
  appliedSaved: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  removeCouponText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.danger,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  couponInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceSubtle,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  applyBtnText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: typography.fontSize.xs,
  },
  quickCouponsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  couponPill: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  couponPillCode: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  couponPillDesc: {
    fontSize: 10,
    color: colors.textMuted,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
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
    color: '#059669',
    fontWeight: '800',
  },
  discountLabel: {
    fontSize: typography.fontSize.xs,
    color: '#059669',
    fontWeight: '700',
  },
  discountValue: {
    fontSize: typography.fontSize.xs,
    color: '#059669',
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
    paddingTop: 2,
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
    padding: spacing.xs + 2,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  savingsBannerText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: '#065F46',
  },
  bottomBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Platform.OS === 'ios' ? 84 : 64,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bottomLeft: {
    gap: 1,
  },
  bottomPayLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
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
  emptyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: spacing.md,
  },
  emptyHeaderTitle: {
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
  emptyImg: {
    width: 200,
    height: 180,
    marginBottom: spacing.lg,
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
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  browseBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl * 1.5,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.md,
  },
  browseBtnText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: typography.fontSize.md,
  },
});
