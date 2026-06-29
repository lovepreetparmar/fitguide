import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_NAME } from '@/constants/app';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { href: '/(tabs)', path: '/', label: 'Home', icon: 'home' as const },
  { href: '/(tabs)/workout', path: '/workout', label: 'Workout', icon: 'barbell' as const },
  { href: '/(tabs)/exercises', path: '/exercises', label: 'Exercises', icon: 'list' as const },
  { href: '/(tabs)/progress', path: '/progress', label: 'Progress', icon: 'trending-up' as const },
  { href: '/(tabs)/profile', path: '/profile', label: 'Profile', icon: 'person' as const },
];

function isActiveRoute(pathname: string, itemPath: string) {
  if (itemPath === '/') {
    return pathname === '/' || pathname === '/index' || pathname.endsWith('/(tabs)');
  }
  return pathname.includes(itemPath);
}

export function WebSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const profile = useAuthStore((s) => s.profile);

  return (
    <View className="hidden h-full w-64 flex-col border-r border-border bg-card md:flex">
      <View className="border-b border-border px-6 py-6">
        <View className="flex-row items-center">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Text className="text-lg font-bold text-white">FG</Text>
          </View>
          <View>
            <Text className="text-lg font-bold text-text">{APP_NAME}</Text>
            <Text className="text-xs text-text-secondary">Train Smarter</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = isActiveRoute(pathname, item.path);
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => router.push(item.href as never)}
              className={cn(
                'mb-1 flex-row items-center rounded-button px-4 py-3',
                active ? 'bg-primary/20' : 'bg-transparent'
              )}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={active ? '#6C63FF' : '#A0A0A0'}
              />
              <Text
                className={cn(
                  'ml-3 text-sm font-medium',
                  active ? 'text-primary' : 'text-text-secondary'
                )}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="border-t border-border px-6 py-4">
        <Text className="text-sm font-medium text-text">{profile?.name ?? 'Athlete'}</Text>
        <Text className="text-xs text-text-muted">Web · Mobile coming soon</Text>
      </View>
    </View>
  );
}

export function WebTopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const profile = useAuthStore((s) => s.profile);

  const current = NAV_ITEMS.find((item) => isActiveRoute(pathname, item.path));

  return (
    <View className="flex-row items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
      <View className="flex-row items-center">
        <View className="mr-2 h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Text className="text-sm font-bold text-white">FG</Text>
        </View>
        <Text className="text-base font-semibold text-text">{current?.label ?? APP_NAME}</Text>
      </View>
      <TouchableOpacity onPress={() => router.push('/(tabs)/profile' as never)}>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/30">
          <Text className="text-sm font-bold text-primary">
            {profile?.name?.charAt(0)?.toUpperCase() ?? 'A'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export function WebShell({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View className="min-h-screen flex-1 flex-row bg-background">
      <WebSidebar />
      <View className="flex-1">
        <WebTopBar />
        <View className="flex-1 overflow-auto">{children}</View>
      </View>
    </View>
  );
}
