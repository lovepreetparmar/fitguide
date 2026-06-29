import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthWebLayout } from '@/components/layout/AuthWebLayout';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInAsGuest, isLoading } = useAuthStore();
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      await signIn(data.email, data.password, rememberMe);
      router.replace('/');
    } catch {
      setError('Invalid email or password');
    }
  };

  const handleGuest = () => {
    signInAsGuest();
    router.replace('/');
  };

  const form = (
    <ScrollView
      contentContainerClassName="flex-grow"
      keyboardShouldPersistTaps="handled"
    >
      {Platform.OS !== 'web' && (
        <TouchableOpacity onPress={() => router.back()} className="mb-8">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

          <Text className="mb-2 text-3xl font-bold text-text">Welcome back</Text>
          <Text className="mb-8 text-base text-text-secondary">
            Sign in to continue your fitness journey
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
                placeholder="Enter your password"
                icon="lock-closed-outline"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <View className="mb-6 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              className="flex-row items-center"
            >
              <Ionicons
                name={rememberMe ? 'checkbox' : 'square-outline'}
                size={22}
                color={rememberMe ? '#6C63FF' : '#666666'}
              />
              <Text className="ml-2 text-sm text-text-secondary">Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text className="text-sm text-primary">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={isLoading} fullWidth size="lg" />

          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1 bg-border" />
            <Text className="mx-4 text-sm text-text-muted">or continue with</Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          <View className="mb-6 flex-row gap-3">
            <Button
              title="Google"
              variant="outline"
              onPress={() => {}}
              className="flex-1"
              icon={<Ionicons name="logo-google" size={18} color="#FFFFFF" />}
            />
            <Button
              title="Apple"
              variant="outline"
              onPress={() => {}}
              className="flex-1"
              icon={<Ionicons name="logo-apple" size={18} color="#FFFFFF" />}
            />
          </View>

          <Button title="Continue as Guest" variant="ghost" onPress={handleGuest} fullWidth />

          <View className="mt-8 flex-row items-center justify-center">
            <Text className="text-sm text-text-secondary">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-sm font-semibold text-primary">Sign Up</Text>
            </TouchableOpacity>
          </View>
    </ScrollView>
  );

  if (Platform.OS === 'web') {
    return <AuthWebLayout>{form}</AuthWebLayout>;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-8">{form}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
