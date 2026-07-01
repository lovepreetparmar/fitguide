import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';
import { APP_NAME } from '@/constants/app';
import { Button } from '@/components/ui/Button';

export default function SplashScreen() {
  const router = useRouter();

  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  useEffect(() => {
    contentOpacity.value = withDelay(150, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    contentTranslateY.value = withDelay(150, withSpring(0, { damping: 18, stiffness: 120 }));
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['#0D0B1A', '#090909', '#090909']}
        locations={[0, 0.5, 1]}
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center px-8">
          <Animated.View style={contentStyle} className="w-full max-w-sm items-center">
            <Text className="mb-2 text-center text-4xl font-bold tracking-tight text-text">
              {APP_NAME}
            </Text>
            <Text className="mb-10 text-center text-base text-text-secondary">
              Train smarter. Lift better.
            </Text>

            <Button
              title="Sign In"
              onPress={() => router.push('/(auth)/login')}
              fullWidth
              size="lg"
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
