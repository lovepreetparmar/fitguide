import React, { useEffect, useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PASSWORD_MIN_LENGTH } from '@/constants/auth';
import { authService } from '@/services/auth';
import { supabase } from '@/services/supabase';

async function establishSessionFromUrl(url: string) {
  const hash = url.includes('#') ? url.split('#')[1] : '';
  const query = url.includes('?') ? url.split('?')[1]?.split('#')[0] : '';
  const params = new URLSearchParams(hash || query);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token) return false;
  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? '',
  });
  return !error;
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handle = async (url: string | null) => {
      if (!url) return;
      if (url.includes('reset-password') || url.includes('type=recovery')) {
        const ok = await establishSessionFromUrl(url);
        setReady(ok);
        if (!ok) {
          Alert.alert('Link expired', 'Request a new reset email from the login screen.');
        }
      }
    };
    void Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', ({ url }) => void handle(url));
    return () => sub.remove();
  }, []);

  const onSubmit = async () => {
    if (password.length < PASSWORD_MIN_LENGTH) {
      Alert.alert('Password too short', `Use at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }
    setLoading(true);
    try {
      await authService.updatePassword(password);
      Alert.alert('Password updated', 'You can sign in with your new password.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <Text className="mb-2 text-3xl font-bold text-text">New password</Text>
        <Text className="mb-8 text-base text-text-secondary">
          {ready
            ? 'Choose a new password for your account.'
            : 'Open the link from your email to continue, or paste the recovery link in the app.'}
        </Text>
        <Input
          label="New password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
        />
        <Button
          title="Update password"
          onPress={onSubmit}
          loading={loading}
          fullWidth
          size="lg"
          disabled={!ready}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
