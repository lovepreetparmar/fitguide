import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export function AuthLandingBranding() {
  return (
    <View className="items-center">
      <LinearGradient
        colors={['#8B5CF6', '#6C63FF', '#5A52E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="mb-4 h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          shadowColor: '#6C63FF',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.45,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Ionicons name="barbell" size={30} color="#FFFFFF" />
      </LinearGradient>

      <Text className="mb-1.5 text-center text-[32px] font-bold tracking-tight">
        <Text className="text-text">Fit </Text>
        <Text className="text-primary">Guide</Text>
      </Text>
      <Text className="text-center text-base text-text-secondary">Track. Improve. Be Better.</Text>
    </View>
  );
}
