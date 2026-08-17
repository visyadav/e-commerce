import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '@/theme';
import { PRODUCTS_DATA, ProductItem } from '@/constants/products';
import { ProductCard } from '@/components/product-card';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;

const CATEGORIES = [
  { id: 'All Items', name: 'All Items' },
  { id: 'Fresh Milk', name: 'Fresh Milk' },
  { id: 'Paneer & Butter', name: 'Paneer & Butter' },
  { id: 'Curd & Lassi', name: 'Curd & Dahi' },
  { id: 'Plant Based', name: 'Plant Based' },
];

export function AllProductsGrid() {
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'relevance' | 'priceLow' | 'priceHigh'>('relevance');

  // Filter products by category & search query
  let filtered = PRODUCTS_DATA.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All Items' ||
      product.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products
  if (sortOption === 'priceLow') {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortOption === 'priceHigh') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  return (
    <View style={styles.container}>
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
          {CATEGORIES.map((cat) => {
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
          Showing <Text style={styles.countBold}>{filtered.length}</Text> products
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
      {filtered.length > 0 ? (
        <View style={styles.productGrid}>
          {filtered.map((item) => (
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
              width={cardWidth}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySub}>
            Try searching for a different item or select another category.
          </Text>
        </View>
      )}
    </View>
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
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: 95,
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
