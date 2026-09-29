import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { AuthLoginBranding } from '@/components/auth/AuthLoginBranding';
import { SocialSignInButtons } from '@/components/auth/SocialSignInButtons';

interface AuthLoginHeroContentProps {
  onSuccess: () => void;
  onEmailPress: () => void;
  onGuestPress: () => void | Promise<void>;
}

export function AuthLoginHeroContent({
  onSuccess,
  onEmailPress,
  onGuestPress,
}: AuthLoginHeroContentProps) {
  const brandOpacity = useSharedValue(0);
  const brandY = useSharedValue(14);
  const buttonsOpacity = useSharedValue(0);
  const buttonsY = useSharedValue(18);

  useEffect(() => {
    brandOpacity.value = withDelay(120, withTiming(1, { duration: 320 }));
    brandY.value = withDelay(120, withTiming(0, { duration: 320 }));
    buttonsOpacity.value = withDelay(220, withTiming(1, { duration: 320 }));
    buttonsY.value = withDelay(220, withTiming(0, { duration: 320 }));
  }, [brandOpacity, brandY, buttonsOpacity, buttonsY]);

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ translateY: brandY.value }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsY.value }],
  }));

  return (
    <View className="w-full max-w-[400px] self-center">
      <Animated.View style={brandStyle}>
        <AuthLoginBranding variant="hero" />
      </Animated.View>
      <Animated.View style={buttonsStyle}>
        <SocialSignInButtons
          variant="hero"
          onSuccess={onSuccess}
          onEmailPress={onEmailPress}
          onGuestPress={onGuestPress}
          className="w-full"
        />
      </Animated.View>
    </View>
  );
}
