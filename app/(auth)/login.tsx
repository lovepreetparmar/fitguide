import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SocialSignInButtons } from '@/components/auth/SocialSignInButtons';
import { Button } from '@/components/ui/Button';
import { APP_NAME } from '@/constants/app';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const signInAsGuest = useAuthStore((s) => s.signInAsGuest);

  const handleSuccess = () => {
    router.replace('/');
  };

  const handleGuest = () => {
    signInAsGuest();
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="absolute left-6 top-14 z-10">
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <View className="w-full max-w-sm items-center">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Ionicons name="barbell" size={32} color="#6C63FF" />
          </View>

          <Text className="mb-2 text-center text-3xl font-bold text-text">Sign In</Text>
          <Text className="mb-8 text-center text-base text-text-secondary">
            Sign in with Google to access {APP_NAME}
          </Text>

          <SocialSignInButtons onSuccess={handleSuccess} className="mb-3 w-full" />

          <Button
            title="Continue as Guest"
            variant="outline"
            onPress={handleGuest}
            fullWidth
            size="lg"
            icon={<Ionicons name="person-outline" size={20} color="#FFFFFF" />}
          />

          <Text className="mt-6 text-center text-xs leading-5 text-text-muted">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
