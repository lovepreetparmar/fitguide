import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ScreenErrorBoundary } from '@/components/ui/ScreenErrorBoundary';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <AuthProvider>
          <ScreenErrorBoundary fallbackTitle="Fit Guide hit a snag">
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#090909' } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="exercise/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="workout/player" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="nutrition/log" options={{ presentation: 'card' }} />
            <Stack.Screen name="nutrition/add-food" options={{ presentation: 'card' }} />
            <Stack.Screen name="nutrition/scan-barcode" options={{ presentation: 'card' }} />
            <Stack.Screen name="nutrition/scan-meal" options={{ presentation: 'card' }} />
            <Stack.Screen name="nutrition/describe-meal" options={{ presentation: 'card' }} />
            <Stack.Screen name="settings/index" options={{ presentation: 'card' }} />
            <Stack.Screen name="settings/privacy" options={{ presentation: 'card' }} />
            <Stack.Screen name="measurements/index" options={{ presentation: 'card' }} />
          </Stack>
          </ScreenErrorBoundary>
        </AuthProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
