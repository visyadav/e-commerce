import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '@/theme';
import { useLocationStore, LocationItem } from '@/store/location-store';

export function AddressPickerModal() {
  const {
    currentLocation,
    savedLocations,
    activeHubs,
    isPickerModalOpen,
    closePickerModal,
    setLocation,
    checkCustomLocation,
  } = useLocationStore();

  const [inputAddress, setInputAddress] = useState('');
  const [inputPincode, setInputPincode] = useState('');

  const handleAddNewAddress = () => {
    if (!inputAddress) return;
    checkCustomLocation(inputAddress, inputPincode);
    setInputAddress('');
    setInputPincode('');
  };

  const primaryHub = activeHubs.length > 0 ? activeHubs[0] : null;

  return (
    <Modal
      visible={isPickerModalOpen}
      transparent
      animationType="slide"
      onRequestClose={closePickerModal}
    >
      <TouchableWithoutFeedback onPress={closePickerModal}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.sheetHeader}>
                <View style={styles.titleRow}>
                  <Ionicons name="location" size={22} color={colors.primary} />
                  <Text style={styles.sheetTitle}>Select Delivery Address</Text>
                </View>
                <TouchableOpacity onPress={closePickerModal} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Active Hub Info Banner */}
                {primaryHub && (
                  <View style={styles.hubInfoBanner}>
                    <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
                    <Text style={styles.hubInfoText}>
                      Active Hub: <Text style={styles.boldText}>{primaryHub.name}</Text> ({primaryHub.radiusInKm} KM Delivery Radius)
                    </Text>
                  </View>
                )}

                {/* Saved / Available Delivery Hubs List */}
                <Text style={styles.sectionLabel}>ACTIVE DELIVERY ZONES</Text>
                {savedLocations.length === 0 ? (
                  <Text style={styles.emptyText}>Fetching active delivery zones from server...</Text>
                ) : (
                  savedLocations.map((item) => {
                    const isSelected = currentLocation?.id === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.8}
                        onPress={() => setLocation(item)}
                        style={[
                          styles.locationCard,
                          isSelected && styles.selectedLocationCard,
                          !item.isServiceable && styles.unserviceableCard,
                        ]}
                      >
                        <View style={styles.cardLeft}>
                          <View
                            style={[
                              styles.radioCircle,
                              isSelected && styles.radioCircleActive,
                            ]}
                          >
                            {isSelected && <View style={styles.radioInner} />}
                          </View>

                          <View style={styles.locationTextGroup}>
                            <View style={styles.cardTitleRow}>
                              <Text style={styles.cardTitle}>{item.title}</Text>

                              {/* Serviceability Badge */}
                              {item.isServiceable ? (
                                <View style={styles.badgeServiceable}>
                                  <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
                                  <Text style={styles.badgeServiceableText}>
                                    Serviceable {item.distanceInKm > 0 ? `(${item.distanceInKm} KM)` : ''}
                                  </Text>
                                </View>
                              ) : (
                                <View style={styles.badgeUnserviceable}>
                                  <Ionicons name="alert-circle" size={12} color={colors.danger} />
                                  <Text style={styles.badgeUnserviceableText}>
                                    Outside Zone {item.distanceInKm > 0 ? `(${item.distanceInKm} KM)` : ''}
                                  </Text>
                                </View>
                              )}
                            </View>

                            <Text style={styles.addressText} numberOfLines={2}>
                              {item.address}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}

                {/* Add Custom Location Input */}
                <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>CHECK CUSTOM ADDRESS</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.addressInput}
                    placeholder="Enter Sector or Address (e.g. Sector 62 or Sector 79)..."
                    placeholderTextColor={colors.textMuted}
                    value={inputAddress}
                    onChangeText={setInputAddress}
                  />
                  <TextInput
                    style={[styles.addressInput, { width: 100 }]}
                    placeholder="Pincode"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={inputPincode}
                    onChangeText={setInputPincode}
                  />
                  <TouchableOpacity
                    onPress={handleAddNewAddress}
                    style={styles.checkButton}
                  >
                    <Text style={styles.checkButtonText}>Check Serviceability API</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: 30,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sheetTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  hubInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  hubInfoText: {
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    flex: 1,
  },
  boldText: {
    fontWeight: '800',
    color: colors.primaryDark,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  emptyText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginVertical: spacing.xs,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  selectedLocationCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  unserviceableCard: {
    borderColor: colors.dangerLight,
    backgroundColor: colors.dangerLight,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  locationTextGroup: {
    flex: 1,
    gap: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  badgeServiceable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    gap: 3,
  },
  badgeServiceableText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  badgeUnserviceable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    gap: 3,
  },
  badgeUnserviceableText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.danger,
  },
  addressText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  inputContainer: {
    gap: spacing.xs,
  },
  addressInput: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 42,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  checkButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  checkButtonText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: typography.fontSize.sm,
  },
});

export default AddressPickerModal;
