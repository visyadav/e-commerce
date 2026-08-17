import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth-store';

export default function ProfileScreen() {
  const { isAuthenticated, user, logout, openLoginModal } = useAuthStore();

  const menuOptions = [
    { icon: 'location-outline', title: 'Delivery Addresses', subtitle: 'Manage home & office address' },
    { icon: 'card-outline', title: 'Payment Methods', subtitle: 'UPI, Cards & Wallet' },
    { icon: 'notifications-outline', title: 'Notifications', subtitle: 'Order status alerts & offers' },
    { icon: 'help-circle-outline', title: 'Customer Support', subtitle: '24x7 Help & Contact Us' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color={colors.textWhite} />
          </View>

          <View style={styles.userInfo}>
            {isAuthenticated && user ? (
              <>
                <Text style={styles.userName}>{user.fullName}</Text>
                <Text style={styles.userPhone}>+91 {user.phoneNumber}</Text>
              </>
            ) : (
              <>
                <Text style={styles.userName}>Guest Customer</Text>
                <Text style={styles.userPhone}>Login to track orders & earn rewards</Text>
              </>
            )}
          </View>
        </View>

        {/* Account Menu */}
        <View style={styles.menuSection}>
          {menuOptions.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuRow}>
              <View style={styles.menuIconBox}>
                <Ionicons name={item.icon as any} size={22} color={colors.primary} />
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSub}>{item.subtitle}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Auth Action Button */}
        {isAuthenticated ? (
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={colors.secondary} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={() => openLoginModal()}>
            <Ionicons name="phone-portrait-outline" size={20} color={colors.textWhite} />
            <Text style={styles.loginText}>Login with Mobile Number</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 80,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    elevation: 2,
    shadowColor: colors.cardBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    gap: 4,
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userPhone: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: spacing.md,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuSub: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryLight,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  logoutText: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: typography.fontSize.md,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  loginText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: typography.fontSize.md,
  },
});
