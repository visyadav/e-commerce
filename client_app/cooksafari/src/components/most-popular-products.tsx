import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '@/theme';
import { PRODUCTS_DATA, ProductItem } from '@/constants/products';

interface PopularCardProps {
  product: ProductItem;
  rank: number;
}

function PopularProductCard({ product, rank }: PopularCardProps) {
  const [quantity, setQuantity] = useState(0);

  return (
    <View style={styles.popularCard}>
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
          <Text style={styles.reviewsVal}>({product.reviewsCount || 1200}+)</Text>
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
              onPress={() => setQuantity(1)}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>ADD</Text>
              <Ionicons name="add" size={14} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.stepperBox}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => (q > 0 ? q - 1 : 0))}
                style={styles.stepBtn}
              >
                <Ionicons name="remove" size={12} color={colors.textWhite} />
              </TouchableOpacity>
              <Text style={styles.stepVal}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                style={styles.stepBtn}
              >
                <Ionicons name="add" size={12} color={colors.textWhite} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export function MostPopularProducts() {
  // Pick top 4 products for Most Popular section
  const popularList = PRODUCTS_DATA.slice(0, 5);

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

      {/* Horizontal Scrollable Product Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {popularList.map((item, index) => (
          <PopularProductCard key={item.id} product={item} rank={index + 1} />
        ))}
      </ScrollView>
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
});

export default MostPopularProducts;
