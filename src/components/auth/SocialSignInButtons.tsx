import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { isSupabaseConfigured } from '@/services/supabase';

interface SocialSignInButtonsProps {
  onSuccess?: () => void;
  className?: string;
}

export function SocialSignInButtons({ onSuccess, className }: SocialSignInButtonsProps) {
  const { signInWithGoogle, isLoading } = useAuthStore();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Sign in unavailable',
        'Google sign-in requires a connected backend. Add your Supabase keys to continue.'
      );
      return;
    }

    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed. Please try again.';
      if (message !== 'Sign in cancelled') {
        Alert.alert('Sign in failed', message);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <View className={className}>
      <Button
        title="Continue with Google"
        variant="outline"
        onPress={handleGoogleSignIn}
        loading={isLoading && isSigningIn}
        disabled={isLoading && isSigningIn}
        fullWidth
        size="lg"
        icon={<Ionicons name="logo-google" size={20} color="#FFFFFF" />}
      />
      {!isSupabaseConfigured && (
        <Text className="mt-4 text-center text-xs text-text-muted">
          Configure Supabase to enable account sign-in.
        </Text>
      )}
    </View>
  );
}
