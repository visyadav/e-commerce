import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { StyleSheet, Platform, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { FloatingCartBar } from '@/components/floating-cart-bar';

function LiquidGlassTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;
  const isIOS = Platform.OS === 'ios';
  const totalTabs = state.routes.length;
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth / totalTabs;

  // Animated sliding liquid glass pill position
  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(state.index * tabWidth, {
            damping: 16,
            stiffness: 170,
            mass: 0.7,
          }),
        },
      ],
    };
  });

  return (
    <View style={isIOS ? styles.tabBarContainerIOS : styles.tabBarContainerAndroid}>
      {/* Background Liquid Glass Blur for iOS */}
      {isIOS && (
        <BlurView
          tint="regular"
          intensity={85}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Animated Liquid Glass Active Pill Highlight (iOS Only) */}
      {isIOS && (
        <Animated.View style={[{ width: tabWidth, height: 50, position: 'absolute', top: 6, left: 0, paddingHorizontal: 10 }, animatedPillStyle]}>
          <View style={styles.liquidGlassPill}>
            <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
            <View style={styles.glassHighlightGlow} />
          </View>
        </Animated.View>
      )}

      {/* Tab Items */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const color = isFocused ? colors.tabBarActive : colors.tabBarInactive;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabButton}
          >
            <View style={styles.tabContent}>
              {options.tabBarIcon?.({ focused: isFocused, color, size: 22 })}
              <Text style={[styles.tabLabel, { color }]}>{options.title}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

import { useCartStore } from '@/store/cart-store';

export default function TabLayout() {
  const totalCartItems = useCartStore((s) => s.getTotalItems());

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <LiquidGlassTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="products"
          options={{
            title: 'Products',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'grid' : 'grid-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color, focused }) => (
              <View style={{ position: 'relative' }}>
                <Ionicons
                  name={focused ? 'cart' : 'cart-outline'}
                  size={22}
                  color={color}
                />
                {totalCartItems > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      backgroundColor: colors.secondary,
                      borderRadius: 9,
                      minWidth: 16,
                      height: 16,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 3,
                    }}
                  >
                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>
                      {totalCartItems}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'receipt' : 'receipt-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      <FloatingCartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainerIOS: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 84,
    paddingBottom: 28,
    paddingTop: 6,
    backgroundColor: 'transparent',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.12)',
    elevation: 0,
  },
  tabBarContainerAndroid: {
    flexDirection: 'row',
    backgroundColor: colors.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: colors.tabBarBorder,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  liquidGlassPill: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  glassHighlightGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
