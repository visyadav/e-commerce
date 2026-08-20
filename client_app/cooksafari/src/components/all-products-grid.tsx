import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '@/theme';
import { ProductCard } from '@/components/product-card';
import { productService, ClientProductDto } from '@/services/api/product-service';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;

export function AllProductsGrid() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'relevance' | 'priceLow' | 'priceHigh'>('relevance');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([
    { id: 'all', name: 'All Items' },
  ]);

  const [products, setProducts] = useState<ClientProductDto[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await productService.getCategories();
      if (res.success && res.data && res.data.length > 0) {
        const apiCats = res.data.map((c) => ({ id: c.slug, name: c.name }));
        setCategories([{ id: 'all', name: 'All Items' }, ...apiCats]);
      }
    } catch (err) {
      console.warn('Error fetching categories:', err);
    }
  };

  const fetchInitialProducts = async () => {
    try {
      setIsLoadingInitial(true);
      const res = await productService.getProducts({
        categorySlug: selectedCategory,
        search: searchQuery,
        pageNumber: 1,
        pageSize: 10,
      });

      if (res.success && res.data) {
        setProducts(res.data);
        setHasMore(res.data.length === 10);
      } else {
        setProducts([]);
        setHasMore(false);
      }
    } catch (err) {
      console.warn('Error fetching initial products:', err);
      setProducts([]);
      setHasMore(false);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  // 1. Fetch Categories from API
  useEffect(() => {
    loadCategories();
  }, []);

  // 2. Fetch Initial 10 Products when Category or Search changes
  useEffect(() => {
    fetchInitialProducts();
  }, [selectedCategory, searchQuery]);

  // Pull to refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchInitialProducts(), loadCategories()]);
    } catch (err) {
      console.warn('Error refreshing product grid:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // 3. Load 5 More Products on Scroll
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || isLoadingInitial) return;

    try {
      setIsLoadingMore(true);
      const currentCount = products.length;
      // Calculate effective page number for next 5 items batch
      const apiPageNumber = currentCount === 10 ? 3 : Math.floor((currentCount - 10) / 5) + 3;

      const res = await productService.getProducts({
        categorySlug: selectedCategory,
        search: searchQuery,
        pageNumber: apiPageNumber,
        pageSize: 5,
      });

      if (res.success && res.data && res.data.length > 0) {
        const newItems = res.data;
        setProducts((prev) => [...prev, ...newItems]);
        setHasMore(newItems.length === 5);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn('Error loading more products:', err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Scroll detection handler for automatic infinite scroll
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 120;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && hasMore && !isLoadingMore && !isLoadingInitial) {
      handleLoadMore();
    }
  };

  // Sort products locally
  let displayProducts = [...products];
  if (sortOption === 'priceLow') {
    displayProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'priceHigh') {
    displayProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <ScrollView
      style={styles.container}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* 1. Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search all products & groceries..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* 2. Category Filter Pills */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Sub-Header: Item Count & Sort Options */}
      <View style={styles.sortHeader}>
        <Text style={styles.countText}>
          Showing <Text style={styles.countBold}>{displayProducts.length}</Text> products
        </Text>

        <View style={styles.sortPillRow}>
          <TouchableOpacity
            onPress={() =>
              setSortOption((current) =>
                current === 'relevance'
                  ? 'priceLow'
                  : current === 'priceLow'
                  ? 'priceHigh'
                  : 'relevance'
              )
            }
            style={styles.sortPill}
          >
            <Feather name="sliders" size={13} color={colors.primary} />
            <Text style={styles.sortPillText}>
              {sortOption === 'relevance'
                ? 'Popular'
                : sortOption === 'priceLow'
                ? 'Price: Low'
                : 'Price: High'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Products Grid */}
      {isLoadingInitial ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : displayProducts.length > 0 ? (
        <View>
          <View style={styles.productGrid}>
            {displayProducts.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                price={item.price}
                originalPrice={item.originalPrice}
                unit={item.unit}
                imageUrl={item.imageUrl}
                badge={item.badge}
                discountPercentage={item.discountPercentage}
                rating={item.rating}
                isVeg={item.isVeg}
                stockQuantity={item.stockQuantity}
                width={cardWidth}
              />
            ))}
          </View>

          {/* 5. Infinite Scroll Footer Loader / Action */}
          <View style={styles.footerLoader}>
            {isLoadingMore ? (
              <View style={styles.loadingMoreRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingMoreText}>Loading 5 more products...</Text>
              </View>
            ) : hasMore ? (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                activeOpacity={0.8}
                onPress={handleLoadMore}
              >
                <Ionicons name="arrow-down-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.loadMoreBtnText}>Load 5 More Products</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.allLoadedText}>✓ All products loaded</Text>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="nutrition-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptySub}>
            Products added in the Admin Portal will appear here live.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 42,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  categoryContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs + 2,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSubtle,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.textWhite,
  },
  sortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  countText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  countBold: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  sortPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  sortPillText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.primary,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  loadingMoreText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: '700',
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  loadMoreBtnText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: typography.fontSize.xs,
  },
  allLoadedText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default AllProductsGrid;
