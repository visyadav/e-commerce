import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth-store';

export default function ProfileScreen() {
  const { isAuthenticated, user, logout, openLoginModal, updateName } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenEdit = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setEditName(user?.fullName || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    const clean = editName.trim();
    if (!clean) {
      Alert.alert('Invalid Name', 'Please enter a valid name.');
      return;
    }

    setIsLoading(true);
    const res = await updateName(clean);
    setIsLoading(false);

    if (res.success) {
      Alert.alert('Profile Updated 🎉', 'Your name has been updated successfully!');
      setIsEditModalOpen(false);
    } else {
      Alert.alert('Update Failed', res.message);
    }
  };

  const menuOptions = [
    { icon: 'create-outline', title: 'Edit Profile Details', subtitle: 'Update your display name', action: handleOpenEdit },
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
        <TouchableOpacity activeOpacity={0.9} style={styles.userCard} onPress={handleOpenEdit}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color={colors.textWhite} />
          </View>

          <View style={styles.userInfo}>
            {isAuthenticated && user ? (
              <>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{user.fullName}</Text>
                  <Ionicons name="pencil" size={15} color={colors.primary} />
                </View>
                <Text style={styles.userPhone}>+91 {user.phoneNumber}</Text>
              </>
            ) : (
              <>
                <Text style={styles.userName}>Guest Customer</Text>
                <Text style={styles.userPhone}>Login to track orders & earn rewards</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Account Menu */}
        <View style={styles.menuSection}>
          {menuOptions.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuRow} onPress={item.action}>
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

      {/* Edit Profile Name Modal */}
      <Modal visible={isEditModalOpen} transparent animationType="fade" onRequestClose={() => setIsEditModalOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Update Full Name</Text>
            <Text style={styles.modalSub}>Enter your name as you want it to appear on orders and profile.</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, isLoading && styles.disabledBtn]} disabled={isLoading} onPress={handleSaveEdit}>
                {isLoading ? (
                  <ActivityIndicator color={colors.textWhite} size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    elevation: 5,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSub: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  modalInput: {
    height: 48,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  cancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: typography.fontSize.sm,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  saveBtnText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: typography.fontSize.sm,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
