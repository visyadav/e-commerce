import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '@/theme';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

export function MobileLoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginWithMobile, updateName, pendingCartAction } = useAuthStore();
  const { addItem } = useCartStore();

  const [step, setStep] = useState<'PHONE' | 'OTP' | 'NAME'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSendOtp = () => {
    const cleanPhone = phoneNumber.trim();
    if (cleanPhone.length < 10) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setStep('OTP');
  };

  const finishLoginProcess = (nameToDisplay?: string) => {
    if (pendingCartAction) {
      addItem(pendingCartAction.product, pendingCartAction.quantity);
      Alert.alert(
        'Login Successful! 🎉',
        `Welcome${nameToDisplay ? `, ${nameToDisplay}` : ''}! ${pendingCartAction.product.name} has been added to your cart.`
      );
    } else {
      Alert.alert('Welcome! 🎉', `Logged in successfully${nameToDisplay ? `, ${nameToDisplay}` : ''}!`);
    }
    resetForm();
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the 4-digit OTP code (e.g. 1234).');
      return;
    }

    setIsLoading(true);
    const res = await loginWithMobile(phoneNumber, otp);
    setIsLoading(false);

    if (res.success && res.user) {
      const existingName = res.user.fullName;
      const isDefaultName = !existingName || 
        existingName.toLowerCase().startsWith('customer ') || 
        existingName.toLowerCase().startsWith('user ') ||
        existingName.trim() === '';

      if (!isDefaultName) {
        // Existing user already has a custom name set! Complete login immediately.
        finishLoginProcess(existingName);
      } else {
        // New user or default name -> Ask for optional name in Step 3!
        setStep('NAME');
      }
    } else {
      Alert.alert('Login Failed', res.message);
    }
  };

  const handleSaveName = async () => {
    const clean = fullName.trim();
    if (clean.length > 0) {
      setIsLoading(true);
      await updateName(clean);
      setIsLoading(false);
      finishLoginProcess(clean);
    } else {
      finishLoginProcess();
    }
  };

  const handleSkipName = () => {
    finishLoginProcess();
  };

  const resetForm = () => {
    setStep('PHONE');
    setPhoneNumber('');
    setOtp('');
    setFullName('');
    closeLoginModal();
  };

  return (
    <Modal
      visible={isLoginModalOpen}
      transparent
      animationType="slide"
      onRequestClose={resetForm}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity onPress={resetForm} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerBox}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={step === 'NAME' ? 'person' : 'phone-portrait'}
                size={28}
                color={colors.primary}
              />
            </View>
            <Text style={styles.title}>
              {step === 'PHONE'
                ? 'Login with Mobile Number'
                : step === 'OTP'
                ? 'Enter Verification Code'
                : "Welcome! What's your name?"}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'PHONE'
                ? 'Login to add products to your cart & get instant 10-minute delivery.'
                : step === 'OTP'
                ? `We've sent a 4-digit code to +91 ${phoneNumber}`
                : 'Adding your name is optional. You can also update it anytime in Profile.'}
            </Text>
          </View>

          {/* Form Content */}
          {step === 'PHONE' ? (
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryFlagPill}>
                  <Text style={styles.flagText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, phoneNumber.length < 10 && styles.disabledBtn]}
                disabled={phoneNumber.length < 10}
                onPress={handleSendOtp}
              >
                <Text style={styles.primaryBtnText}>Get OTP</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.textWhite} />
              </TouchableOpacity>
            </View>
          ) : step === 'OTP' ? (
            <View style={styles.formGroup}>
              {/* Demo Hint Banner */}
              <View style={styles.demoBanner}>
                <Ionicons name="information-circle" size={16} color={colors.primary} />
                <Text style={styles.demoBannerText}>
                  Demo Mode: Enter any 4-digit code (e.g. <Text style={{ fontWeight: '800' }}>1234</Text>)
                </Text>
              </View>

              <Text style={styles.inputLabel}>Enter 4-Digit OTP</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="• • • •"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                value={otp}
                onChangeText={setOtp}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.primaryBtn, otp.length < 4 && styles.disabledBtn]}
                disabled={otp.length < 4 || isLoading}
                onPress={handleVerifyOtp}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textWhite} />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Verify & Continue</Text>
                    <Ionicons name="checkmark-circle" size={18} color={colors.textWhite} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('PHONE')} style={styles.changePhoneBtn}>
                <Text style={styles.changePhoneText}>← Change Mobile Number</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* STEP 3: OPTIONAL NAME ENTRY FOR NEW USERS */
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Your Full Name (Optional)</Text>
              <TextInput
                style={styles.nameInput}
                placeholder="Enter your name (e.g. Rahul Sharma)"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && styles.disabledBtn]}
                disabled={isLoading}
                onPress={handleSaveName}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textWhite} />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>
                      {fullName.trim().length > 0 ? 'Save Name & Continue' : 'Continue'}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.textWhite} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSkipName} style={styles.changePhoneBtn}>
                <Text style={styles.changePhoneText}>Skip for Now →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerBox: {
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  formGroup: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 4,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  countryFlagPill: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    height: 48,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  nameInput: {
    height: 44,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  otpInput: {
    height: 52,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 8,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 6,
  },
  demoBannerText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  primaryBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  disabledBtn: {
    backgroundColor: colors.textMuted,
    opacity: 0.6,
  },
  primaryBtnText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.md,
    fontWeight: '800',
  },
  changePhoneBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },
  changePhoneText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
  },
});

export default MobileLoginModal;
