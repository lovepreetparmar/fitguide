import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface AuthBackButtonProps {
  onPress: () => void;
}

export function AuthBackButton({ onPress }: AuthBackButtonProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 active:bg-black/50"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      }}
    >
      <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
    </Pressable>
  );
}
