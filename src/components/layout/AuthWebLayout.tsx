import React from 'react';
import { View, Platform } from 'react-native';
import { cn } from '@/utils/cn';

interface AuthLayoutProps {
  children: React.ReactNode;
  wide?: boolean;
}

export function AuthWebLayout({ children, wide = false }: AuthLayoutProps) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View className="min-h-screen flex-1 items-center justify-center bg-background px-4 py-8">
      <View
        className={cn(
          'w-full rounded-card border border-border bg-card p-6 md:p-8',
          wide ? 'max-w-lg' : 'max-w-md'
        )}
      >
        {children}
      </View>
    </View>
  );
}
