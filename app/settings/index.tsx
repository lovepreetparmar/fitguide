import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { notificationService } from '@/services/notifications';
import { profileService } from '@/services/auth';
import { canSyncUserToSupabase } from '@/utils/userId';

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile, setProfile } = useAuthStore();
  const userId = profile?.user_id ?? '';
  const [unitsMetric, setUnitsMetric] = useState(profile?.units !== 'imperial');

  const { data: prefs } = useQuery({
    queryKey: ['notification-prefs', userId],
    queryFn: () => notificationService.getPreferences(userId),
    enabled: Boolean(userId),
  });

  const [workoutReminder, setWorkoutReminder] = useState(true);
  const [waterReminder, setWaterReminder] = useState(true);

  useEffect(() => {
    if (!prefs) return;
    setWorkoutReminder(prefs.workout_reminder);
    setWaterReminder(prefs.water_reminder);
  }, [prefs]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (canSyncUserToSupabase(userId) && profile) {
        const updated = await profileService.updateProfile(userId, {
          units: unitsMetric ? 'metric' : 'imperial',
        });
        setProfile(updated);
        await notificationService.savePreferences(userId, {
          workout_reminder: workoutReminder,
          water_reminder: waterReminder,
        });
        if (workoutReminder) {
          const granted = await notificationService.requestPermissions();
          if (granted) await notificationService.scheduleWorkoutReminder(8, 0);
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notification-prefs'] });
      Alert.alert('Saved', 'Settings updated.');
    },
    onError: (e: Error) => Alert.alert('Error', e.message),
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center px-5 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-card"
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-5">
        <Card className="mb-4">
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-base text-text">Metric units (kg, cm)</Text>
            <Switch value={unitsMetric} onValueChange={setUnitsMetric} />
          </View>
        </Card>

        <Text className="mb-2 text-sm font-semibold text-text-secondary">Reminders</Text>
        <Card className="mb-4">
          <View className="flex-row items-center justify-between border-b border-border py-3">
            <Text className="text-base text-text">Workout reminder (8:00)</Text>
            <Switch value={workoutReminder} onValueChange={setWorkoutReminder} />
          </View>
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-base text-text">Water reminder</Text>
            <Switch value={waterReminder} onValueChange={setWaterReminder} />
          </View>
        </Card>

        <Button
          title={saveMutation.isPending ? 'Saving…' : 'Save settings'}
          onPress={() => saveMutation.mutate()}
          fullWidth
          className="mb-4"
        />

        <TouchableOpacity
          onPress={() => router.push('/settings/privacy')}
          className="mb-8 flex-row items-center justify-between rounded-card bg-card px-4 py-4"
        >
          <Text className="text-base text-text">Privacy & data</Text>
          <Ionicons name="chevron-forward" size={18} color="#666" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
