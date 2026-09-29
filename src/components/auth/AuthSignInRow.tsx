import React from 'react';
import { Pressable, Text, View, ActivityIndicator, type PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { cn } from '@/utils/cn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESS_TIMING = { duration: 200 };

interface AuthSignInRowProps extends Omit<PressableProps, 'children'> {
  title: string;
  icon: React.ReactNode;
  loading?: boolean;
  variant?: 'default' | 'glass';
}

export function AuthSignInRow({
  title,
  icon,
  loading = false,
  disabled,
  onPress,
  className,
  variant = 'default',
  ...props
}: AuthSignInRowProps) {
  const pressed = useSharedValue(0);
  const glass = variant === 'glass';

  const idleBg = glass ? 'rgba(8, 8, 10, 0.86)' : 'rgba(22, 22, 22, 1)';
  const pressedBg = glass ? 'rgba(22, 20, 32, 0.92)' : 'rgba(28, 26, 38, 1)';
  const idleBorder = glass ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.09)';
  const pressedBorder = 'rgba(108, 99, 255, 0.45)';

  const animatedContainer = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(pressed.value ? 0.985 : 1, PRESS_TIMING) }],
    borderColor: interpolateColor(pressed.value, [0, 1], [idleBorder, pressedBorder]),
    backgroundColor: interpolateColor(pressed.value, [0, 1], [idleBg, pressedBg]),
  }));

  const handlePress = (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  return (
    <AnimatedPressable
      className={cn(
        'mb-3 min-h-[60px] w-full flex-row items-center rounded-[18px] border px-4',
        (disabled || loading) && 'opacity-50',
        className
      )}
      disabled={disabled || loading}
      onPress={handlePress}
      onPressIn={() => {
        pressed.value = withTiming(1, PRESS_TIMING);
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, PRESS_TIMING);
      }}
      accessibilityRole="button"
      style={[
        animatedContainer,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: glass ? 0.35 : 0.28,
          shadowRadius: 8,
          elevation: 4,
        },
      ]}
      {...props}
    >
      <View
        className={cn(
          'h-10 w-10 items-center justify-center rounded-xl',
          glass ? 'bg-white/[0.06]' : 'border border-white/[0.06] bg-white/[0.04]'
        )}
      >
        {icon}
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center py-3">
          <ActivityIndicator color="#FFFFFF" />
        </View>
      ) : (
        <Text
          className="ml-3.5 flex-1 text-base font-medium text-text"
          maxFontSizeMultiplier={1.35}
        >
          {title}
        </Text>
      )}
      <View className="h-11 w-8 items-center justify-center">
        {!loading ? <Ionicons name="chevron-forward" size={18} color="#8A8A8A" /> : null}
      </View>
    </AnimatedPressable>
  );
}
