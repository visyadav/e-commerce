import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '@/theme';
import { productService, ClientProductDto } from '@/services/api/product-service';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';

import { useRouter } from 'expo-router';

interface PopularCardProps {
  product: ClientProductDto;
  rank: number;
}

function PopularProductCard({ product, rank }: PopularCardProps) {
  const router = useRouter();
  const { getItemQuantity, addItem, updateQuantity } = useCartStore();
  const { isAuthenticated, openLoginModal } = useAuthStore();

  const quantity = getItemQuantity(product.id);

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

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.popularCard}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      {/* Rank Badge Tag */}
      <View style={styles.rankBadge}>
        <Ionicons name="flame" size={12} color="#FFFFFF" />
        <Text style={styles.rankText}>#{rank} Popular</Text>
      </View>

      {/* Image Area */}
      <View style={styles.imageBox}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.productImg}
          resizeMode="cover"
        />
      </View>

      {/* Product Details */}
      <View style={styles.detailsBox}>
        {/* Rating Row */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={styles.ratingVal}>{product.rating || 4.9}</Text>
          <Text style={styles.reviewsVal}>(1.2k+)</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {product.name}
        </Text>

        {/* Unit */}
        <Text style={styles.unit}>{product.unit}</Text>

        {/* Bottom Price & Add Action Row */}
        <View style={styles.bottomRow}>
          <View style={styles.priceCol}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.originalPrice ? (
              <Text style={styles.origPrice}>₹{product.originalPrice}</Text>
            ) : null}
          </View>

          {quantity === 0 ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleIncrement}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>ADD</Text>
              <Ionicons name="add" size={14} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.stepperBox}>
              <TouchableOpacity
                onPress={handleDecrement}
                style={styles.stepBtn}
              >
                <Ionicons name="remove" size={12} color={colors.textWhite} />
              </TouchableOpacity>
              <Text style={styles.stepVal}>{quantity}</Text>
              <TouchableOpacity
                onPress={handleIncrement}
                style={styles.stepBtn}
              >
                <Ionicons name="add" size={12} color={colors.textWhite} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function MostPopularProducts() {
  const [popularProducts, setPopularProducts] = useState<ClientProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadPopular() {
      try {
        setIsLoading(true);
        const res = await productService.getPopularProducts(10);
        if (res.success && res.data) {
          setPopularProducts(res.data);
        } else {
          setPopularProducts([]);
        }
      } catch (err) {
        console.warn('Error fetching popular products:', err);
        setPopularProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadPopular();
  }, []);

  return (
    <View style={styles.sectionContainer}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.flameIconBox}>
            <Ionicons name="flame" size={18} color="#FF6B00" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Most Popular Products</Text>
            <Text style={styles.headerSubtitle}>Highest ordered by customers this week</Text>
          </View>
        </View>
      </View>

      {/* Horizontal Scrollable Product Cards or States */}
      {isLoading ? (
        <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={{ marginTop: spacing.xs, color: colors.textMuted, fontSize: 11 }}>
            Loading popular products...
          </Text>
        </View>
      ) : popularProducts.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollList}
        >
          {popularProducts.map((item, index) => (
            <PopularProductCard key={item.id} product={item} rank={index + 1} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="flame-outline" size={28} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Popular Products Found</Text>
          <Text style={styles.emptySub}>Products added in Admin Portal will appear here live.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flameIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF4ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  scrollList: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  popularCard: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  rankBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    zIndex: 10,
    gap: 3,
  },
  rankText: {
    color: colors.textWhite,
    fontSize: 10,
    fontWeight: '800',
  },
  imageBox: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  detailsBox: {
    padding: spacing.md,
    gap: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  ratingVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewsVal: {
    fontSize: 10,
    color: colors.textMuted,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  unit: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: typography.fontSize.md,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  origPrice: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  addBtnText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 11,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 3,
    paddingVertical: 3,
    gap: 4,
  },
  stepBtn: {
    width: 20,
    height: 20,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepVal: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: 12,
    minWidth: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  emptySub: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default MostPopularProducts;
