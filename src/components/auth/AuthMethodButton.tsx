import React from 'react';
import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  type PressableProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { cn } from '@/utils/cn';

interface AuthMethodButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  icon: React.ReactNode;
  loading?: boolean;
  showTopBorder?: boolean;
}

export function AuthMethodButton({
  title,
  icon,
  loading = false,
  disabled,
  showTopBorder = false,
  onPress,
  className,
  ...props
}: AuthMethodButtonProps) {
  const handlePress = (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  return (
    <Pressable
      className={cn(
        'min-h-[52px] w-full flex-row items-center px-4 active:opacity-80',
        showTopBorder && 'border-t border-border',
        (disabled || loading) && 'opacity-50',
        className
      )}
      disabled={disabled || loading}
      onPress={handlePress}
      accessibilityRole="button"
      {...props}
    >
      <View className="mr-3 w-7 items-center justify-center">{icon}</View>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="flex-1 text-base font-semibold text-text">{title}</Text>
      )}
    </Pressable>
  );
}
