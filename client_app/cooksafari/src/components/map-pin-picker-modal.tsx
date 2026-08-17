import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import MapView, { Region, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '@/theme';
import * as ExpoLocation from 'expo-location';
import { useLocationStore, LocationItem, HUB_LAT, HUB_LNG } from '@/store/location-store';
import { locationService } from '@/services/api/location-service';
import { addressService } from '@/services/api/address-service';

const { width, height } = Dimensions.get('window');

export function MapPinPickerModal() {
  const {
    currentLocation,
    savedLocations,
    isPickerModalOpen,
    closePickerModal,
    setLocation,
    detectLocationFromGps,
  } = useLocationStore();

  const mapRef = useRef<MapView>(null);

  // Map Region & Pinpoint Coordinates State
  const [region, setRegion] = useState<Region>({
    latitude: currentLocation?.latitude || HUB_LAT,
    longitude: currentLocation?.longitude || HUB_LNG,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });

  // Serviceability State
  const [isChecking, setIsChecking] = useState(false);
  const [isServiceable, setIsServiceable] = useState(true);
  const [serviceMessage, setServiceMessage] = useState('Delivery available at this location!');
  const [distanceKm, setDistanceKm] = useState(0);

  // Address Form State
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // When modal opens, animate map to current location
  useEffect(() => {
    if (isPickerModalOpen) {
      const initialLat = currentLocation?.latitude || HUB_LAT;
      const initialLng = currentLocation?.longitude || HUB_LNG;
      const initialRegion = {
        latitude: initialLat,
        longitude: initialLng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };

      setRegion(initialRegion);
      mapRef.current?.animateToRegion(initialRegion, 800);
      handleRegionChangeComplete(initialRegion);
    }
  }, [isPickerModalOpen]);

  const checkPinpointServiceability = async (lat: number, lng: number, pinToUse?: string) => {
    try {
      setIsChecking(true);
      const targetPincode = (pinToUse !== undefined ? pinToUse : pincode).trim();

      if (!targetPincode) {
        setIsServiceable(false);
        setServiceMessage('Enter or select a pincode to check delivery serviceability.');
        return;
      }

      const res = await locationService.checkServiceability({
        pincode: targetPincode,
        latitude: lat,
        longitude: lng,
        sectorOrAddress: street || 'Pinpoint Location',
      });

      if (res.success && res.data) {
        setIsServiceable(res.data.isServiceable);
        setDistanceKm(res.data.distanceInKm ?? 0);
        setServiceMessage(res.data.message);
      } else {
        setIsServiceable(false);
        const errMsg = res.errors && res.errors.length > 0 ? res.errors.join(', ') : res.message || 'Failed to verify service status';
        setServiceMessage(`[Debug Error] API Status Failed: ${errMsg}`);
      }
    } catch (err: any) {
      setIsServiceable(false);
      const detail = err?.message || String(err);
      setServiceMessage(`[Debug Network Error] Cannot connect to Web API at http://192.168.1.3:5185 (${detail})`);
    } finally {
      setIsChecking(false);
    }
  };

  // Called when user stops dragging / panning / zooming on the Map
  const handleRegionChangeComplete = async (newRegion: Region) => {
    setRegion(newRegion);
    setIsChecking(true);
    let detectedPincode = '';

    try {
      const geocode = await ExpoLocation.reverseGeocodeAsync({
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      });

      if (geocode && geocode.length > 0 && geocode[0].postalCode) {
        detectedPincode = geocode[0].postalCode.trim();
        setPincode(detectedPincode);
      } else {
        setPincode('');
      }
    } catch {
      setPincode('');
    }

    checkPinpointServiceability(newRegion.latitude, newRegion.longitude, detectedPincode);
  };

  // Select a Saved Address from the chip list
  const handleSelectSavedAddress = (item: LocationItem) => {
    const targetRegion = {
      latitude: item.latitude,
      longitude: item.longitude,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    };
    setRegion(targetRegion);
    mapRef.current?.animateToRegion(targetRegion, 600);
    checkPinpointServiceability(item.latitude, item.longitude);
    setLocation(item);
  };

  // Snap Map back to user's real GPS location
  const handleSnapToUserGps = async () => {
    const gpsLoc = await detectLocationFromGps();
    if (gpsLoc) {
      const newRegion = {
        latitude: gpsLoc.latitude,
        longitude: gpsLoc.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 600);
      checkPinpointServiceability(gpsLoc.latitude, gpsLoc.longitude);
    }
  };

  const handleSaveAddress = async () => {
    if (!street.trim()) {
      alert('Please enter street or area address');
      return;
    }

    try {
      setIsSaving(true);

      // Save to UserAddress DB model via Client API with exact latitude and longitude
      const saveRes = await addressService.createAddress({
        label,
        houseNo,
        street,
        landmark,
        city: 'Noida',
        state: 'Uttar Pradesh',
        zipCode: pincode || '201309',
        latitude: region.latitude,
        longitude: region.longitude,
        phone,
        isDefaultShipping: true,
      });

      // Update Location Store with latitude and longitude
      const newLocation: LocationItem = {
        id: saveRes.data ? `saved-${saveRes.data.id}` : `user-addr-${Date.now()}`,
        title: `${label} (${houseNo || street.split(',')[0]})`,
        address: `${houseNo ? houseNo + ', ' : ''}${street}`,
        pincode: pincode || '201309',
        latitude: region.latitude,
        longitude: region.longitude,
        isServiceable,
        distanceInKm: distanceKm,
        source: 'manual',
        message: serviceMessage,
      };

      await setLocation(newLocation);
      closePickerModal();
    } catch (err) {
      closePickerModal();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={isPickerModalOpen}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={closePickerModal}
    >
      <View style={styles.fullScreenContainer}>
        {/* 1. FULL SCREEN INTERACTIVE MAP VIEW */}
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_DEFAULT}
          initialRegion={region}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
        />

        {/* 2. CENTERED FIXED TARGET PIN BUBBLE */}
        <View style={styles.centerPinWrapper} pointerEvents="none">
          <View style={[styles.pinBubble, !isServiceable && styles.pinBubbleDanger]}>
            <Text style={styles.pinBubbleText}>
              {isChecking ? 'Checking...' : isServiceable ? 'Order Deliver Here 📍' : 'Outside Service Zone 🚫'}
            </Text>
          </View>
          <Ionicons
            name="location"
            size={46}
            color={isServiceable ? colors.primary : colors.danger}
          />
          <View style={styles.pinShadow} />
        </View>

        {/* 3. TOP OVERLAY CONTROL BAR */}
        <View style={styles.topOverlayBar}>
          <TouchableOpacity style={styles.backCircleBtn} onPress={closePickerModal}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.topHeaderTitleBox}>
            <Text style={styles.topHeaderTitle}>Set Delivery Location</Text>
            <Text style={styles.topHeaderSub}>Drag map to pinpoint your exact door</Text>
          </View>

          {/* Snap to User GPS Button */}
          <TouchableOpacity style={styles.gpsSnapBtn} onPress={handleSnapToUserGps}>
            <Ionicons name="locate" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* 4. BOTTOM SLIDING ADDRESS SHEET WITH KEYBOARD AVOIDING VIEW */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.bottomSheetCard}>
            <View style={styles.dragHandleBar} />

            {/* Serviceability Alert Status */}
            {isChecking ? (
              <View style={styles.statusChecking}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.checkingText}>Checking delivery serviceability at pin...</Text>
              </View>
            ) : isServiceable ? (
              <View style={styles.statusSuccess}>
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusSuccessTitle}>Service Available 🎉</Text>
                  <Text style={styles.statusSuccessSub} numberOfLines={1}>{serviceMessage}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.statusDanger}>
                <Ionicons name="alert-circle" size={22} color={colors.danger} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusDangerTitle}>Delivery Not Available Here 🚫</Text>
                  <Text style={styles.statusDangerSub} numberOfLines={1}>{serviceMessage}</Text>
                </View>
              </View>
            )}

            {/* Address Form Scroll Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* SAVED ADDRESSES QUICK SELECT CHIPS */}
              {savedLocations.length > 0 && (
                <View style={styles.savedSection}>
                  <Text style={styles.sectionLabel}>YOUR SAVED ADDRESSES</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.savedScroll}
                  >
                    {savedLocations.map((item) => {
                      const isSelected = currentLocation?.id === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => handleSelectSavedAddress(item)}
                          style={[
                            styles.savedChip,
                            isSelected && styles.savedChipActive,
                          ]}
                        >
                          <Ionicons
                            name="home"
                            size={14}
                            color={isSelected ? colors.textWhite : colors.primary}
                          />
                          <View>
                            <Text style={[styles.savedChipTitle, isSelected && styles.savedChipTitleActive]}>
                              {item.title}
                            </Text>
                            <Text style={[styles.savedChipSub, isSelected && styles.savedChipSubActive]} numberOfLines={1}>
                              {item.address}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {isServiceable ? (
                <View style={styles.formFieldsContainer}>
                  {/* Address Label Pills */}
                  <View style={styles.tagSelector}>
                    {(['Home', 'Work', 'Other'] as const).map((t) => (
                      <TouchableOpacity
                        key={t}
                        onPress={() => setLabel(t)}
                        style={[styles.tagPill, label === t && styles.tagPillActive]}
                      >
                        <Ionicons
                          name={t === 'Home' ? 'home-outline' : t === 'Work' ? 'briefcase-outline' : 'location-outline'}
                          size={14}
                          color={label === t ? colors.textWhite : colors.textSecondary}
                        />
                        <Text style={[styles.tagText, label === t && styles.tagTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* House No / Building */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>House / Flat / Building No. *</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="e.g. Flat 402, Building A"
                      placeholderTextColor={colors.textMuted}
                      value={houseNo}
                      onChangeText={setHouseNo}
                    />
                  </View>

                  {/* Street Address */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Street Address / Area *</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="e.g. Green Meadows, Sector 62, Noida"
                      placeholderTextColor={colors.textMuted}
                      value={street}
                      onChangeText={setStreet}
                    />
                  </View>

                  <View style={styles.fieldRow}>
                    {/* Landmark */}
                    <View style={[styles.fieldGroup, { flex: 1 }]}>
                      <Text style={styles.fieldLabel}>Landmark (Optional)</Text>
                      <TextInput
                        style={styles.fieldInput}
                        placeholder="e.g. Near Fortis Hospital"
                        placeholderTextColor={colors.textMuted}
                        value={landmark}
                        onChangeText={setLandmark}
                      />
                    </View>

                    {/* Pincode */}
                    <View style={[styles.fieldGroup, { width: 110 }]}>
                      <Text style={styles.fieldLabel}>Pincode *</Text>
                      <TextInput
                        style={styles.fieldInput}
                        placeholder="201309"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="number-pad"
                        value={pincode}
                        onChangeText={(val) => {
                          setPincode(val);
                          if (val.trim().length === 6) {
                            checkPinpointServiceability(region.latitude, region.longitude, val.trim());
                          }
                        }}
                      />
                    </View>
                  </View>

                  {/* Phone */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Mobile Phone (For Delivery updates)</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="+91 98765 43210"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>

                  {/* Submit Save Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSaveAddress}
                    disabled={isSaving}
                    style={styles.saveBtn}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color={colors.textWhite} />
                    ) : (
                      <Text style={styles.saveBtnText}>Save & Proceed to Deliver →</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.unserviceableWarningBox}>
                  <Text style={styles.unserviceableText}>
                    Please drag the map to pinpoint a location inside our active delivery zone (Sector 62, Noida).
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  centerPinWrapper: {
    position: 'absolute',
    top: (height * 0.48) / 2 - 25,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  pinBubble: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginBottom: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  pinBubbleDanger: {
    backgroundColor: colors.danger,
  },
  pinBubbleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  pinShadow: {
    width: 10,
    height: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderRadius: 5,
    marginTop: -2,
  },
  topOverlayBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 30,
  },
  backCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  topHeaderTitleBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  topHeaderTitle: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
  },
  topHeaderSub: {
    color: '#94A3B8',
    fontSize: 10,
  },
  gpsSnapBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  bottomSheetCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    maxHeight: height * 0.75,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardBorder,
    alignSelf: 'center',
    marginVertical: spacing.xs,
  },
  statusChecking: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  checkingText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  statusSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs + 2,
    marginBottom: spacing.xs,
  },
  statusSuccessTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  statusSuccessSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  statusDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs + 2,
    marginBottom: spacing.xs,
  },
  statusDangerTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.danger,
  },
  statusDangerSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  formScrollContent: {
    paddingBottom: spacing.lg,
  },
  savedSection: {
    marginBottom: spacing.xs,
    gap: 4,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  savedScroll: {
    gap: spacing.xs,
    paddingVertical: 4,
  },
  savedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    gap: 6,
    maxWidth: 200,
  },
  savedChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  savedChipTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  savedChipTitleActive: {
    color: colors.textWhite,
  },
  savedChipSub: {
    fontSize: 10,
    color: colors.textMuted,
  },
  savedChipSubActive: {
    color: colors.primaryLight,
  },
  formFieldsContainer: {
    gap: spacing.sm,
  },
  tagSelector: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginVertical: 4,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  tagPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tagTextActive: {
    color: colors.textWhite,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  fieldLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fieldInput: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 40,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  saveBtnText: {
    color: colors.textWhite,
    fontWeight: '800',
    fontSize: typography.fontSize.sm,
  },
  unserviceableWarningBox: {
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  unserviceableText: {
    color: colors.danger,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
});

export default MapPinPickerModal;
