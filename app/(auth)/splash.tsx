import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AuthScreenBackground } from '@/components/auth/AuthScreenBackground';
import { AuthLandingBranding } from '@/components/auth/AuthLandingBranding';
import { AuthLandingHero } from '@/components/auth/AuthLandingHero';
import { AuthLandingFeatureRow } from '@/components/auth/AuthLandingFeatureRow';
import { AuthLegalFooter } from '@/components/auth/AuthLegalFooter';

export default function SplashScreen() {
  const router = useRouter();

  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    contentTranslateY.value = withDelay(100, withSpring(0, { damping: 18, stiffness: 120 }));
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <View className="flex-1 bg-background">
      <AuthScreenBackground variant="landing" />

      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <ScrollView
          contentContainerClassName="flex-grow px-6 pb-6 pt-2"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={contentStyle} className="w-full max-w-sm flex-1 self-center">
            <AuthLandingBranding />

            <AuthLandingHero />

            <AuthLandingFeatureRow />

            <View className="mt-6">
              <Pressable
                testID="splash-get-started"
                onPress={() => {
                  haptic();
                  router.push('/(auth)/register');
                }}
                accessibilityRole="button"
                accessibilityLabel="Get Started"
                className="relative mb-3 h-14 w-full items-center justify-center rounded-full bg-primary active:opacity-90"
                style={{
                  shadowColor: '#6C63FF',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.35,
                  shadowRadius: 16,
                  elevation: 6,
                }}
              >
                <Text className="text-lg font-semibold text-white">Get Started</Text>
                <View className="absolute right-5">
                  <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
                </View>
              </Pressable>

              <Pressable
                testID="splash-sign-in"
                onPress={() => {
                  haptic();
                  router.push('/(auth)/login');
                }}
                accessibilityRole="button"
                accessibilityLabel="Sign In"
                className="items-center py-2 active:opacity-80"
              >
                <Text className="text-base font-semibold text-primary">Sign In</Text>
              </Pressable>

              <AuthLegalFooter />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
