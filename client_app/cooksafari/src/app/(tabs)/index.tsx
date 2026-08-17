import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { PRODUCTS_DATA } from '@/constants/products';
import { ProductCard } from '@/components/product-card';
import { MostPopularProducts } from '@/components/most-popular-products';
import { useLocationStore } from '@/store/location-store';
import { AddressPickerModal } from '@/components/address-picker-modal';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;

const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: 'apps-outline' },
  { id: 'milk', name: 'Fresh Milk', icon: 'nutrition-outline' },
  { id: 'paneer', name: 'Paneer & Butter', icon: 'cube-outline' },
  { id: 'curd', name: 'Curd & Dahi', icon: 'bowl-outline' },
  { id: 'vegan', name: 'Plant Based', icon: 'leaf-outline' },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { currentLocation, openPickerModal } = useLocationStore();

  const isServiceable = currentLocation ? currentLocation.isServiceable : true;

  const filteredProducts =
    selectedCategory === 'all'
      ? PRODUCTS_DATA
      : PRODUCTS_DATA.filter((p) =>
          p.category.toLowerCase().includes(selectedCategory)
        );

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

      {/* Non-Serviceable Warning Banner */}
      {currentLocation && !currentLocation.isServiceable && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={openPickerModal}
          style={styles.warningBanner}
        >
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={20} color="#991B1B" />
            <Text style={styles.warningTitle}>Location Outside Delivery Zone</Text>
          </View>
          <Text style={styles.warningSub}>
            {currentLocation.message ||
              `CookSafari currently delivers only within 5 KM of our active hubs. ${currentLocation.title} is ${currentLocation.distanceInKm} KM away.`}
          </Text>
          <View style={styles.switchLocationPill}>
            <Text style={styles.switchLocationText}>Switch Delivery Address →</Text>
          </View>
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

        <View style={styles.productGrid}>
          {filteredProducts.map((item) => (
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

        {/* 6. Most Popular Products Component (Bottom Section) */}
        <MostPopularProducts />
      </ScrollView>

      {/* Address Picker Modal */}
      <AddressPickerModal />
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
  warningBanner: {
    backgroundColor: '#FEE2E2',
    borderBottomWidth: 1,
    borderBottomColor: '#FCA5A5',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warningTitle: {
    color: '#991B1B',
    fontWeight: '800',
    fontSize: typography.fontSize.xs,
  },
  warningSub: {
    color: '#7F1D1D',
    fontSize: 11,
    lineHeight: 15,
  },
  switchLocationPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#991B1B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    marginTop: 2,
  },
  switchLocationText: {
    color: '#FFFFFF',
    fontSize: 10,
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
