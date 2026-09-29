import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FEATURES = [
  { icon: 'barbell-outline' as const, label: 'Track\nWorkouts', color: '#6C63FF', bg: 'rgba(108, 99, 255, 0.2)' },
  { icon: 'restaurant-outline' as const, label: 'Log\nNutrition', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.2)' },
  { icon: 'stats-chart-outline' as const, label: 'Monitor\nProgress', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.2)' },
  { icon: 'flag-outline' as const, label: 'Reach Your\nGoals', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.2)' },
];

export function AuthLandingFeatureRow() {
  return (
    <View className="w-full flex-row justify-between px-1">
      {FEATURES.map((feature) => (
        <View key={feature.icon} className="flex-1 items-center px-0.5">
          <View
            className="mb-2 h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: feature.bg }}
          >
            <Ionicons name={feature.icon} size={20} color={feature.color} />
          </View>
          <Text className="text-center text-[10px] leading-3.5 text-text-secondary">{feature.label}</Text>
        </View>
      ))}
    </View>
  );
}
