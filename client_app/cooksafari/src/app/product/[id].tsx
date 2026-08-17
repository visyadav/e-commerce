import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '@/theme';
import { productService, ClientProductDto } from '@/services/api/product-service';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct] = useState<ClientProductDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { getItemQuantity, addItem, updateQuantity, getTotalItems } = useCartStore();
  const { isAuthenticated, openLoginModal } = useAuthStore();

  const totalCartItems = getTotalItems();
  const quantity = product ? getItemQuantity(product.id) : 0;

  useEffect(() => {
    async function loadProductDetails() {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await productService.getProductById(id);
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.warn('Error fetching product details:', err);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadProductDetails();
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <View style={styles.errorHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.errorHeaderTitle}>Product Not Found</Text>
        </View>
        <View style={styles.errorBody}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.errorTitle}>Product Unavailable</Text>
          <Text style={styles.errorSub}>The requested product could not be found or has been removed.</Text>
          <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.backHomeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const galleryImages =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : [product.imageUrl];

  const cartProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    unit: product.unit,
    imageUrl: product.imageUrl,
  };

  const handleIncrement = () => {
    if (!isAuthenticated) {
      openLoginModal({
        product: cartProduct,
        quantity: 1,
      });
      return;
    }
    addItem(cartProduct, 1);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, quantity - 1);
  };

  const discountAmount =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.headerRightRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <View style={{ position: 'relative' }}>
              <Ionicons name="cart-outline" size={24} color={colors.textPrimary} />
              {totalCartItems > 0 && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{totalCartItems}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image Gallery Carousel */}
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {galleryImages.map((imgUrl, index) => (
              <View key={index} style={styles.slideBox}>
                <Image source={{ uri: imgUrl }} style={styles.galleryImg} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>

          {/* Floating Badges */}
          <View style={styles.floatingBadgesRow}>
            {product.isVeg && (
              <View style={styles.vegBadge}>
                <View style={styles.vegDot} />
                <Text style={styles.vegText}>100% PURE VEG</Text>
              </View>
            )}
            {product.discountPercentage && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discountPercentage}</Text>
              </View>
            )}
          </View>

          {/* Pagination Dots */}
          {galleryImages.length > 1 && (
            <View style={styles.paginationRow}>
              {galleryImages.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, activeImageIndex === i && styles.activeDot]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Details Section */}
        <View style={styles.detailsCard}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryName}>{product.categoryName}</Text>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>{product.rating || 4.8}</Text>
              <Text style={styles.reviewCount}>(1.2k+)</Text>
            </View>
          </View>

          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productUnit}>{product.unit}</Text>

          {/* Price Row */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>₹{product.price}</Text>
            {product.originalPrice ? (
              <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
            ) : null}
            {product.discountPercentage ? (
              <View style={styles.savingsPill}>
                <Text style={styles.savingsPillText}>{product.discountPercentage}</Text>
              </View>
            ) : null}
          </View>

          {discountAmount > 0 && (
            <View style={styles.savingsAlert}>
              <Ionicons name="sparkles" size={15} color="#065F46" />
              <Text style={styles.savingsAlertText}>
                You save ₹{discountAmount.toFixed(2)} on this product!
              </Text>
            </View>
          )}

          {/* Guaranteed Delivery Notice */}
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryIconBox}>
              <Ionicons name="flash" size={18} color="#D97706" />
            </View>
            <View style={styles.deliveryCol}>
              <Text style={styles.deliveryTitle}>Superfast 10-15 Mins Delivery</Text>
              <Text style={styles.deliverySub}>Freshly packed from local fulfillment hub</Text>
            </View>
          </View>
        </View>

        {/* About Product Description */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionHeaderTitle}>About Product</Text>
          <Text style={styles.descriptionText}>
            {product.description ||
              `Fresh, pure, and high-quality ${product.name}. Sourced daily under strict hygiene protocols to maintain maximum nutrition and taste.`}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeaderTitle}>Key Highlights</Text>
          <View style={styles.highlightsGrid}>
            <View style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.highlightText}>100% Fresh & Pure Quality</Text>
            </View>
            <View style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.highlightText}>Zero Artificial Preservatives</Text>
            </View>
            <View style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.highlightText}>Cold Chain Maintained</Text>
            </View>
            <View style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.highlightText}>Hygienically Sealed Pack</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomUnitLabel}>{product.unit}</Text>
          <Text style={styles.bottomPriceValue}>₹{product.price}</Text>
        </View>

        {quantity === 0 ? (
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.88} onPress={handleIncrement}>
            <Text style={styles.addBtnText}>ADD TO CART</Text>
            <Ionicons name="add" size={18} color={colors.textWhite} />
          </TouchableOpacity>
        ) : (
          <View style={styles.bottomStepper}>
            <TouchableOpacity onPress={handleDecrement} style={styles.bottomStepBtn}>
              <Ionicons name="remove" size={16} color={colors.textWhite} />
            </TouchableOpacity>
            <Text style={styles.bottomStepVal}>{quantity}</Text>
            <TouchableOpacity onPress={handleIncrement} style={styles.bottomStepBtn}>
              <Ionicons name="add" size={16} color={colors.textWhite} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: spacing.md,
  },
  iconBtn: {
    padding: 4,
  },
  errorHeaderTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  errorBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  errorSub: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  backHomeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backHomeBtnText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: typography.fontSize.sm,
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
    gap: spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badgePill: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.secondary,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.textWhite,
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  imageSection: {
    width: '100%',
    height: 280,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  slideBox: {
    width: width,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImg: {
    width: '90%',
    height: '85%',
  },
  floatingBadgesRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  vegBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    gap: 4,
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  vegText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#059669',
  },
  discountBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  discountText: {
    color: colors.textWhite,
    fontSize: 9,
    fontWeight: '900',
  },
  paginationRow: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  activeDot: {
    width: 18,
    backgroundColor: colors.primary,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  categoryName: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  reviewCount: {
    fontSize: 10,
    color: colors.textMuted,
  },
  productTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  productUnit: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: 2,
  },
  currentPrice: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  originalPrice: {
    fontSize: typography.fontSize.md,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  savingsPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  savingsPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  savingsAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: spacing.xs + 2,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  savingsAlertText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: '#065F46',
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  deliveryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryCol: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: '#92400E',
  },
  deliverySub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
  },
  sectionHeaderTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.md,
  },
  highlightsGrid: {
    gap: spacing.xs + 2,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  highlightText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
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
  bottomPriceCol: {
    gap: 1,
  },
  bottomUnitLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  bottomPriceValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  addBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  addBtnText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: typography.fontSize.md,
  },
  bottomStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    gap: spacing.md,
  },
  bottomStepBtn: {
    padding: 4,
  },
  bottomStepVal: {
    color: colors.textWhite,
    fontWeight: '900',
    fontSize: typography.fontSize.md,
    minWidth: 20,
    textAlign: 'center',
  },
});
