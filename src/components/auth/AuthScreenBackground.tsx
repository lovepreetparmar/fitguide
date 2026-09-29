import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AuthScreenBackgroundProps {
  variant?: 'default' | 'landing' | 'auth';
}

export function AuthScreenBackground({ variant = 'default' }: AuthScreenBackgroundProps) {
  return (
    <View className="absolute inset-0 bg-background" pointerEvents="none">
      <LinearGradient
        colors={variant === 'auth' ? ['#0A0614', '#07070A', '#090909'] : ['#0D0B1A', '#090909', '#090909']}
        locations={[0, 0.5, 1]}
        className="absolute inset-0"
      />
      {variant === 'landing' ? (
        <View className="absolute inset-x-0 top-[26%] items-center">
          <View className="h-80 w-80 rounded-full bg-primary/22" />
        </View>
      ) : variant === 'auth' ? (
        <>
          <View className="absolute inset-x-0 top-[12%] items-center">
            <View className="h-[340px] w-[340px] rounded-full bg-primary/14" />
          </View>
          <View className="absolute inset-x-0 top-[14%] items-center">
            <View className="h-52 w-52 rounded-full bg-primary/10" />
          </View>
          <View className="absolute -left-24 top-[8%] h-44 w-44 rounded-full bg-primary/[0.07]" />
          <View className="absolute -right-20 bottom-[22%] h-52 w-52 rounded-full bg-primary/[0.06]" />
        </>
      ) : (
        <>
          <View
            className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-primary/20"
            style={{ transform: [{ scale: 1.2 }] }}
          />
          <View className="absolute -right-12 top-8 h-48 w-48 rounded-full bg-primary/15" />
        </>
      )}
    </View>
  );
}
