import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '@/theme';

export const OTAUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function checkOTAUpdates() {
      if (__DEV__) return; // Skip in development Expo Go mode

      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setIsUpdateAvailable(true);
        }
      } catch (err) {
        console.log('[OTA Updates] Checked for updates:', err);
      }
    }

    checkOTAUpdates();
  }, []);

  const handleApplyUpdate = async () => {
    try {
      setIsDownloading(true);
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (err) {
      console.warn('[OTA Updates] Update failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {children}

      {/* Instant OTA Update Toast Banner */}
      {isUpdateAvailable && (
        <View style={styles.updateToast}>
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          <View style={{ flex: 1 }}>
            <Text style={styles.updateTitle}>New App Features Available! ✨</Text>
            <Text style={styles.updateSub}>Tap to update instantly without downloading from App Store.</Text>
          </View>

          <TouchableOpacity
            style={styles.updateBtn}
            onPress={handleApplyUpdate}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.updateBtnText}>Update Now</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  updateToast: {
    position: 'absolute',
    bottom: 90,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    zIndex: 9999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  updateTitle: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
  },
  updateSub: {
    color: '#94A3B8',
    fontSize: 10,
  },
  updateBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
