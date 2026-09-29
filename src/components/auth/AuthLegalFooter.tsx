import React from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';

export function AuthLegalFooter() {
  const router = useRouter();

  return (
    <Text className="mt-4 text-center text-xs leading-5 text-text-muted">
      By continuing, you agree to our{'\n'}
      <Text className="text-primary underline" onPress={() => router.push('/settings/privacy')}>
        Terms of Service
      </Text>
      {' and '}
      <Text className="text-primary underline" onPress={() => router.push('/settings/privacy')}>
        Privacy Policy
      </Text>
      .
    </Text>
  );
}
