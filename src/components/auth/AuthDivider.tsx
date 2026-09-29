import React from 'react';
import { View, Text } from 'react-native';

export function AuthDivider({ label }: { label: string }) {
  return (
    <View className="my-4 w-full flex-row items-center gap-3">
      <View className="h-px flex-1 bg-border" />
      <Text className="text-xs text-text-muted">{label}</Text>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}
