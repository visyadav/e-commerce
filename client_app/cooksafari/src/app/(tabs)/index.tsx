import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { ProductCard } from '@/components/product-card';
import { MostPopularProducts } from '@/components/most-popular-products';
import { useLocationStore } from '@/store/location-store';
import { useCartStore } from '@/store/cart-store';
import { MapPinPickerModal } from '@/components/map-pin-picker-modal';
import { productService, ClientProductDto } from '@/services/api/product-service';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<{ id: string; name: string; icon?: string }[]>([
    { id: 'all', name: 'All Items', icon: 'apps-outline' },
  ]);
  const [products, setProducts] = useState<ClientProductDto[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { currentLocation, openPickerModal } = useLocationStore();
  const isServiceable = currentLocation ? currentLocation.isServiceable : true;

  const loadCategories = async () => {
    try {
      const res = await productService.getCategories();
      if (res.success && res.data && res.data.length > 0) {
        const apiCats = res.data.map((c) => ({
          id: c.slug,
          name: c.name,
          icon: 'nutrition-outline',
        }));
        setCategories([{ id: 'all', name: 'All Items', icon: 'apps-outline' }, ...apiCats]);
      }
    } catch (err) {
      console.warn('Error fetching categories on home screen:', err);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const res = await productService.getProducts({
        categorySlug: selectedCategory,
        search: searchQuery,
      });

      if (res.success && res.data) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.warn('Error fetching client products:', err);
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // 1. Fetch Categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // 2. Fetch products when category or search changes
  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery]);

  // 3. Pull to Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadCategories(),
        loadProducts(),
        useCartStore.getState().syncWithServer(),
      ]);
    } catch (err) {
      console.warn('Error refreshing home screen:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* 1. Location & Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openPickerModal}
          style={styles.locationContainer}
        >
          <View
            style={[
              styles.locationIconBox,
              !isServiceable && styles.unserviceableIconBox,
            ]}
          >
            <Ionicons
              name={isServiceable ? 'location' : 'alert-circle'}
              size={18}
              color={isServiceable ? colors.primary : colors.danger}
            />
          </View>

          <View style={styles.locationTextContainer}>
            <View style={styles.locationTitleRow}>
              <Text style={styles.locationType}>
                Deliver to {currentLocation?.title || 'Detecting Location...'}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.textPrimary} />
            </View>
            <Text
              style={[
                styles.locationAddress,
                !isServiceable && styles.unserviceableText,
              ]}
              numberOfLines={1}
            >
              {currentLocation
                ? isServiceable
                  ? currentLocation.address
                  : `⚠️ ${currentLocation.title} - Outside Delivery Zone (${currentLocation.distanceInKm} KM)`
                : 'Fetching delivery serviceability from API...'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Profile Avatar Button */}
        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="person-circle-outline" size={36} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Minimal Non-Serviceable Warning Strip */}
      {currentLocation && !currentLocation.isServiceable && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={openPickerModal}
          style={styles.minimalWarningBar}
        >
          <Ionicons name="alert-circle" size={15} color="#EF4444" />
          <Text style={styles.minimalWarningText} numberOfLines={1}>
            Outside delivery area {currentLocation.distanceInKm > 0 ? `(${currentLocation.distanceInKm} KM)` : ''}
          </Text>
          <Text style={styles.minimalChangeLink}>Change Pin →</Text>
        </TouchableOpacity>
      )}

      {/* 2. Search & Filter Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search milk, paneer, ghee, bread..."
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

        <TouchableOpacity style={styles.filterButton}>
          <Feather name="sliders" size={18} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
        {/* 3. Hero Promo Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroContent}>
            <View style={styles.heroTag}>
              <Text style={styles.heroTagText}>7 AM GUARANTEED</Text>
            </View>
            <Text style={styles.heroTitle}>Fresh Morning Milk Delivered Daily</Text>
            <Text style={styles.heroSub}>Zero Preservatives • 100% Organic</Text>

            <TouchableOpacity style={styles.heroCta}>
              <Text style={styles.heroCtaText}>Subscribe Now</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.textWhite} />
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* 4. Horizontal Categories Selector */}
        <View style={styles.categorySection}>
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
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={isSelected ? colors.textWhite : colors.textSecondary}
                  />
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

        {/* 5. Daily Essentials Product Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Essentials</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All →</Text>
          </TouchableOpacity>
        </View>

        {isLoadingProducts ? (
          <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: spacing.xs, color: colors.textMuted, fontSize: typography.fontSize.xs }}>
              Loading fresh products...
            </Text>
          </View>
        ) : products.length > 0 ? (
          <View style={styles.productGrid}>
            {products.map((item) => (
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
        ) : (
          <View style={{ paddingVertical: spacing.xl, paddingHorizontal: spacing.md, alignItems: 'center', backgroundColor: colors.surfaceSubtle, borderRadius: borderRadius.lg, marginHorizontal: spacing.lg }}>
            <Ionicons name="nutrition-outline" size={32} color={colors.textMuted} />
            <Text style={{ marginTop: spacing.xs, color: colors.textPrimary, fontWeight: '700', fontSize: typography.fontSize.sm }}>
              No Products Found
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 2 }}>
              Add products in Admin Portal to display them here live.
            </Text>
          </View>
        )}

        {/* 6. Most Popular Products Component (Bottom Section) */}
        <MostPopularProducts />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flex: 1,
  },
  locationIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unserviceableIconBox: {
    backgroundColor: colors.dangerLight,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationType: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  locationAddress: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  unserviceableText: {
    color: colors.danger,
    fontWeight: '700',
  },
  minimalWarningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    paddingHorizontal: spacing.lg,
    paddingVertical: 7,
    gap: 6,
  },
  minimalWarningText: {
    flex: 1,
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '700',
  },
  minimalChangeLink: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '800',
  },
  profileBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  searchBar: {
    flex: 1,
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
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 95,
  },
  heroBanner: {
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing.lg,
  },
  heroContent: {
    flex: 1,
    zIndex: 2,
    gap: spacing.xs,
  },
  heroTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
  },
  heroTagText: {
    color: colors.textWhite,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: colors.textWhite,
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    lineHeight: 22,
    marginTop: 2,
  },
  heroSub: {
    color: '#94A3B8',
    fontSize: typography.fontSize.xs,
    marginBottom: spacing.xs,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    gap: 4,
  },
  heroCtaText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
  },
  heroImage: {
    width: 110,
    height: 110,
    borderRadius: borderRadius.md,
    opacity: 0.85,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryScroll: {
    gap: spacing.xs + 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.textWhite,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
