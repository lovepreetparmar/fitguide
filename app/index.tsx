import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { isLoading, isAuthenticated, profile } = useAuthStore();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/splash" />;
  }

  if (!profile?.onboarding_completed) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
