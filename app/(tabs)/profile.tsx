import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { FITNESS_GOALS, EXPERIENCE_LEVELS } from '@/constants/app';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut, isGuest } = useAuthStore();
  const { streak, achievements } = useAppStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/splash');
        },
      },
    ]);
  };

  const goalLabel = FITNESS_GOALS.find((g) => g.id === profile?.goal)?.label ?? 'Not set';
  const experienceLabel = EXPERIENCE_LEVELS.find((e) => e.id === profile?.experience)?.label ?? 'Not set';

  const menuItems = [
    { icon: 'body-outline' as const, label: 'Body Measurements', route: null },
    { icon: 'nutrition-outline' as const, label: 'Nutrition', route: null },
    { icon: 'notifications-outline' as const, label: 'Notifications', route: null },
    { icon: 'settings-outline' as const, label: 'Settings', route: null },
    { icon: 'download-outline' as const, label: 'Export Data', route: null },
    { icon: 'shield-outline' as const, label: 'Privacy', route: null },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="mb-6 pt-2 text-2xl font-bold text-text">Profile</Text>

        <Card className="mb-4 items-center py-6">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary">
            <Text className="text-3xl font-bold text-white">
              {profile?.name?.charAt(0)?.toUpperCase() ?? 'A'}
            </Text>
          </View>
          <Text className="text-xl font-bold text-text">{profile?.name ?? 'Athlete'}</Text>
          {isGuest && (
            <View className="mt-2 rounded-full bg-warning/20 px-3 py-1">
              <Text className="text-xs font-medium text-warning">Guest Mode</Text>
            </View>
          )}
          <View className="mt-4 flex-row gap-6">
            <View className="items-center">
              <Text className="text-2xl font-bold text-text">{streak}</Text>
              <Text className="text-xs text-text-secondary">Day Streak</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-text">{achievements.length}</Text>
              <Text className="text-xs text-text-secondary">Achievements</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-text">{profile?.workout_days ?? 0}</Text>
              <Text className="text-xs text-text-secondary">Days/Week</Text>
            </View>
          </View>
        </Card>

        <Text className="mb-3 text-lg font-semibold text-text">Goals & Stats</Text>
        <Card className="mb-4">
          {[
            { label: 'Goal', value: goalLabel },
            { label: 'Experience', value: experienceLabel },
            { label: 'Height', value: profile?.height_cm ? `${profile.height_cm} cm` : '—' },
            { label: 'Weight', value: profile?.weight_kg ? `${profile.weight_kg} kg` : '—' },
            { label: 'Workout Time', value: profile?.workout_time_minutes ? `${profile.workout_time_minutes} min` : '—' },
          ].map((item, i, arr) => (
            <View
              key={item.label}
              className={`flex-row items-center justify-between py-3 ${
                i < arr.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <Text className="text-sm text-text-secondary">{item.label}</Text>
              <Text className="text-sm font-medium text-text">{item.value}</Text>
            </View>
          ))}
        </Card>

        <Text className="mb-3 text-lg font-semibold text-text">Equipment</Text>
        <Card className="mb-4">
          <View className="flex-row flex-wrap gap-2">
            {profile?.equipment?.map((eq) => (
              <View key={eq} className="rounded-full bg-primary/20 px-3 py-1">
                <Text className="text-xs font-medium capitalize text-primary">
                  {eq.replace(/_/g, ' ')}
                </Text>
              </View>
            )) ?? (
              <Text className="text-sm text-text-secondary">No equipment set</Text>
            )}
          </View>
        </Card>

        <Text className="mb-3 text-lg font-semibold text-text">Menu</Text>
        <Card className="mb-4" padding="none">
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              className={`flex-row items-center px-4 py-4 ${
                i < menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={22} color="#A0A0A0" />
              <Text className="ml-4 flex-1 text-base text-text">{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#666666" />
            </TouchableOpacity>
          ))}
        </Card>

        <Button title="Sign Out" variant="danger" onPress={handleSignOut} fullWidth className="mb-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
