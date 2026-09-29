import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AuthLoginBrandingProps {
  variant?: 'default' | 'hero';
}

export function AuthLoginBranding({ variant = 'default' }: AuthLoginBrandingProps) {
  const onHero = variant === 'hero';

  return (
    <View className={onHero ? 'mb-7 items-center' : 'mb-11 items-center'}>
      <View className="relative mb-5 items-center justify-center">
        {onHero ? (
          <View className="absolute h-28 w-28 rounded-full bg-primary/20" />
        ) : (
          <>
            <View className="absolute h-36 w-36 rounded-full bg-primary/12" />
            <View className="absolute h-28 w-28 rounded-full bg-primary/20" />
          </>
        )}
        <LinearGradient
          colors={['#A594FF', '#6C63FF', '#4F46E5']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          className={`${onHero ? 'h-[72px] w-[72px] rounded-[20px]' : 'h-[80px] w-[80px] rounded-[22px]'} items-center justify-center`}
          style={{
            shadowColor: '#6C63FF',
            shadowOffset: { width: 0, height: onHero ? 8 : 12 },
            shadowOpacity: 0.45,
            shadowRadius: onHero ? 16 : 22,
            elevation: 8,
          }}
        >
          <Ionicons name="barbell" size={onHero ? 34 : 38} color="#FFFFFF" />
        </LinearGradient>
      </View>

      <Text
        className="mb-2 text-center text-[32px] font-bold tracking-tight"
        maxFontSizeMultiplier={1.25}
        accessibilityRole="header"
      >
        <Text className="text-text">Fit</Text>
        <Text className="text-primary">Guide</Text>
      </Text>
      <Text
        className="max-w-[280px] text-center text-base leading-[22px] text-text-secondary"
        maxFontSizeMultiplier={1.3}
      >
        Train smarter. Live stronger.
      </Text>
    </View>
  );
}
