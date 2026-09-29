import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginFormSchema, type LoginForm } from '@/constants/auth';
import { useAuthStore } from '@/store/authStore';
import { formatAuthError } from '@/utils/authErrors';

export default function EmailLoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [error, setError] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      await signIn(data.email, data.password);
      router.replace('/');
    } catch (err) {
      setError(formatAuthError(err));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()} className="mb-8" accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>

          <Text className="mb-2 text-3xl font-bold text-text">Sign in with email</Text>
          <Text className="mb-8 text-base text-text-secondary">
            Enter the email and password for your Fit Guide account.
          </Text>

          {error ? (
            <View className="mb-4 rounded-button bg-error/20 px-4 py-3">
              <Text className="text-sm text-error">{error}</Text>
            </View>
          ) : null}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="you@example.com"
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Your password"
                icon="lock-closed-outline"
                secureTextEntry
                autoComplete="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <Button
            testID="login-sign-in-email"
            title="Sign in"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            size="lg"
            className="mt-2"
          />

          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            className="mt-4 items-center"
            accessibilityRole="link"
          >
            <Text className="text-sm text-text-secondary">Forgot password?</Text>
          </Pressable>

          <View className="mt-8 flex-row items-center justify-center">
            <Text className="text-sm text-text-secondary">New here? </Text>
            <Pressable onPress={() => router.push('/(auth)/register')} accessibilityRole="link">
              <Text className="text-sm font-semibold text-primary">Create account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
