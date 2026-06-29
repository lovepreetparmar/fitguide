import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function SplashScreen() {
  const router = useRouter();
  const signInAsGuest = useAuthStore((s) => s.signInAsGuest);
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 600, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(1, { duration: 200 })
    );
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    buttonsOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['#090909', '#161616', '#090909']}
        className="flex-1 items-center justify-center px-8"
      >
        <Animated.View style={logoStyle} className="mb-8 items-center">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-primary">
            <Text className="text-4xl font-bold text-white">FG</Text>
          </View>
          <Text className="text-4xl font-bold text-text">{APP_NAME}</Text>
        </Animated.View>

        <Animated.View style={textStyle} className="mb-16 items-center">
          <Text className="text-center text-lg leading-7 text-text-secondary">
            {APP_TAGLINE}
          </Text>
        </Animated.View>

        <Animated.View style={buttonsStyle} className="w-full">
          <Button
            title="Get Started"
            onPress={() => router.push('/(auth)/register')}
            fullWidth
            size="lg"
            className="mb-3"
          />
          <Button
            title="Sign In"
            variant="outline"
            onPress={() => router.push('/(auth)/login')}
            fullWidth
            size="lg"
            className="mb-3"
          />
          <Button
            title="Continue as Guest"
            variant="ghost"
            onPress={() => {
              signInAsGuest();
              router.replace('/');
            }}
            fullWidth
          />
        </Animated.View>
      </LinearGradient>
    </View>
  );
}
