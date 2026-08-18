import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth-store';
import { clientOrderService, OrderDto } from '@/services/api/order-service';
import { formatImageUrl } from '@/services/api/product-service';

export default function OrdersScreen() {
  const { isAuthenticated, openLoginModal } = useAuthStore();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const res = await clientOrderService.getMyOrders(1, 30);
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (err) {
      console.warn('Failed to load my orders:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchOrders();
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={54} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Please Login to View Orders</Text>
          <Text style={styles.emptySub}>Sign in to track your current and past orders.</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => openLoginModal()}>
            <Text style={styles.loginBtnText}>LOGIN NOW</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSub}>{orders.length} total orders</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching order history...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bag-handle-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptySub}>
                Your completed and active orders will appear here.
              </Text>
            </View>
          ) : (
            orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderId}>#{order.orderNumber}</Text>
                      <Text style={styles.orderDate}>{formattedDate}</Text>
                    </View>

                    <View style={styles.statusBadge}>
                      <Ionicons
                        name={
                          order.status === 'Delivered'
                            ? 'checkmark-circle'
                            : order.status === 'Cancelled'
                            ? 'close-circle'
                            : 'time-outline'
                        }
                        size={14}
                        color={order.status === 'Delivered' ? '#059669' : colors.primary}
                      />
                      <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                  </View>

                  {/* Items breakdown list */}
                  <View style={styles.itemsList}>
                    {order.items?.map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        {item.productImageUrl ? (
                          <Image
                            source={{ uri: formatImageUrl(item.productImageUrl) }}
                            style={styles.itemImg}
                          />
                        ) : (
                          <View style={styles.itemImgPlaceholder}>
                            <Ionicons name="cube-outline" size={16} color={colors.textMuted} />
                          </View>
                        )}
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.productName}
                        </Text>
                        <Text style={styles.itemQty}>x{item.quantity}</Text>
                        <Text style={styles.itemPrice}>₹{item.totalPrice}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Applied Coupon Info if active */}
                  {order.couponCode ? (
                    <View style={styles.couponPill}>
                      <Ionicons name="pricetag-outline" size={12} color={colors.primary} />
                      <Text style={styles.couponPillText}>
                        Coupon '{order.couponCode}' applied (-₹{order.discountAmount})
                      </Text>
                    </View>
                  ) : null}

                  {/* Footer */}
                  <View style={styles.orderFooter}>
                    <View>
                      <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
                      <Text style={styles.orderAmount}>₹{order.totalAmount}</Text>
                    </View>
                    <View style={styles.payBadge}>
                      <Text style={styles.payBadgeText}>COD / Online</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  emptySub: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  loginBtnText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: typography.fontSize.xs,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.xs,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
    paddingBottom: spacing.xs,
  },
  orderId: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  orderDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemsList: {
    paddingVertical: spacing.xs,
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemImg: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.xs,
  },
  itemImgPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  itemQty: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  itemPrice: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  couponPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
    alignSelf: 'flex-start',
  },
  couponPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: spacing.xs,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
  },
  orderAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  payBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  payBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
});
