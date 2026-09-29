import React from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthLoginImageBackground } from '@/components/auth/AuthLoginImageBackground';
import { AuthLoginHeroContent } from '@/components/auth/AuthLoginHeroContent';
import { AuthBackButton } from '@/components/auth/AuthBackButton';
import { useAuthStore } from '@/store/authStore';
import { formatAuthError, isSupabaseSignupDatabaseError } from '@/utils/authErrors';
import { canSyncUserToSupabase } from '@/utils/userId';

export default function LoginScreen() {
  const router = useRouter();
  const signInAsGuest = useAuthStore((s) => s.signInAsGuest);

  const handleSuccess = () => {
    router.replace('/');
  };

  const handleGuest = async () => {
    try {
      await signInAsGuest();
      const userId = useAuthStore.getState().user?.id;
      if (userId && !canSyncUserToSupabase(userId)) {
        Alert.alert(
          'Guest mode (offline)',
          'Cloud guest sign-in is not available yet. You can use the app locally; run database/fix_anonymous_signup.sql in Supabase SQL Editor to enable synced guest accounts.'
        );
      }
      router.replace('/');
    } catch (error) {
      const message = formatAuthError(error);
      Alert.alert(
        'Guest sign-in failed',
        isSupabaseSignupDatabaseError(message)
          ? 'Supabase could not create a cloud guest account. Run database/fix_anonymous_signup.sql in the SQL Editor, or try again after the app update (local guest fallback).'
          : message.includes('Anonymous')
            ? 'Enable Anonymous sign-in under Authentication → Sign In / Providers, then try again.'
            : message
      );
    }
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/splash');
    }
  };

  return (
    <AuthLoginImageBackground>
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="px-5 pt-1">
          <AuthBackButton onPress={goBack} />
        </View>

        <View className="flex-1 justify-end px-5 pb-2">
          <AuthLoginHeroContent
            onSuccess={handleSuccess}
            onEmailPress={() => router.push('/(auth)/email-login')}
            onGuestPress={handleGuest}
          />
        </View>
      </SafeAreaView>
    </AuthLoginImageBackground>
  );
}
