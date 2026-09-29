import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthSignInRow } from '@/components/auth/AuthSignInRow';
import { useAuthStore } from '@/store/authStore';
import { isSupabaseConfigured } from '@/services/supabase';

interface SocialSignInButtonsProps {
  onSuccess?: () => void;
  onEmailPress?: () => void;
  onGuestPress?: () => void;
  className?: string;
  variant?: 'default' | 'hero';
}

export function SocialSignInButtons({
  onSuccess,
  onEmailPress,
  onGuestPress,
  className,
  variant = 'default',
}: SocialSignInButtonsProps) {
  const { signInWithGoogle, isLoading } = useAuthStore();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const busy = (isLoading && isSigningIn) || isGuestLoading;
  const rowVariant = variant === 'hero' ? 'glass' : 'default';

  const handleGuestPress = async () => {
    if (!onGuestPress) return;
    try {
      setIsGuestLoading(true);
      await onGuestPress();
    } finally {
      setIsGuestLoading(false);
    }
  };

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
      <AuthSignInRow
        testID="login-continue-google"
        title="Continue with Google"
        icon={<Ionicons name="logo-google" size={22} color="#FFFFFF" />}
        onPress={handleGoogleSignIn}
        loading={isLoading && isSigningIn}
        disabled={busy}
        variant={rowVariant}
      />
      <AuthSignInRow
        testID="login-continue-email"
        title="Continue with Email"
        icon={<Ionicons name="mail-outline" size={22} color="#FFFFFF" />}
        onPress={onEmailPress}
        disabled={busy || !onEmailPress}
        variant={rowVariant}
      />
      <AuthSignInRow
        testID="login-continue-guest"
        title="Continue as Guest"
        icon={<Ionicons name="person-outline" size={22} color="#FFFFFF" />}
        onPress={handleGuestPress}
        loading={isGuestLoading}
        disabled={busy || !onGuestPress}
        className="mb-0"
        variant={rowVariant}
      />
    </View>
  );
}
