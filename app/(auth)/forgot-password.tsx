import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { isSupabaseConfigured } from '@/services/supabase';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuthStore();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormData) => {
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Unavailable',
        'Password reset requires a connected Supabase account. Use guest mode or demo sign-in for now.'
      );
      return;
    }

    setLoading(true);
    try {
      await resetPassword(data.email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 py-8"
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-8">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {sent ? (
          <View className="flex-1 items-center justify-center">
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-secondary/20">
              <Ionicons name="mail" size={40} color="#00D9A5" />
            </View>
            <Text className="mb-2 text-2xl font-bold text-text">Check your email</Text>
            <Text className="mb-8 text-center text-base text-text-secondary">
              We've sent password reset instructions to your email address.
            </Text>
            <Button title="Back to Sign In" onPress={() => router.push('/(auth)/login')} fullWidth />
          </View>
        ) : (
          <>
            <Text className="mb-2 text-3xl font-bold text-text">Reset password</Text>
            <Text className="mb-8 text-base text-text-secondary">
              Enter your email and we'll send you reset instructions
            </Text>

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

            <Button
              title="Send Reset Link"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              size="lg"
            />
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
