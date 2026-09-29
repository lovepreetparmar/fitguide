import React, { useEffect } from 'react';
import { View, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

/** Replace: assets/images/fitguide-auth-bg.jpg */
export const FITGUIDE_AUTH_BG = require('../../../assets/images/fitguide-auth-bg.jpg');

/** Shift cover crop right so both athletes stay in frame (tune 0.06–0.14). */
const HERO_FOCUS_SHIFT_X = 0;
const HERO_WIDTH_SCALE = 1.14;

interface AuthLoginImageBackgroundProps {
  children: React.ReactNode;
}

export function AuthLoginImageBackground({ children }: AuthLoginImageBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const bgOpacity = useSharedValue(0);

  const imageWidth = width * HERO_WIDTH_SCALE;
  const imageLeft = -width * HERO_FOCUS_SHIFT_X;

  useEffect(() => {
    bgOpacity.value = withTiming(1, { duration: 350 });
  }, [bgOpacity]);

  const animatedHero = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <View className="flex-1 bg-[#050505]">
      <Animated.View style={[StyleSheet.absoluteFill, animatedHero]} pointerEvents="none">
        <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
          <Image
            source={FITGUIDE_AUTH_BG}
            style={{
              position: 'absolute',
              top: 0,
              left: imageLeft,
              width: imageWidth,
              height,
            }}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        </View>
        <LinearGradient
          colors={['rgba(108, 99, 255, 0.14)', 'transparent', 'transparent']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.05)',
            'rgba(8, 6, 14, 0.35)',
            'rgba(5, 5, 8, 0.88)',
            '#050505',
          ]}
          locations={[0, 0.38, 0.68, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View className="flex-1">{children}</View>
    </View>
  );
}
