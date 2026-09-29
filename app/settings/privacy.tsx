import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { flushSyncOutbox } from '@/services/sync/syncWorker';
import { outboxService } from '@/services/sync/outbox';
import { isSupabaseConfigured } from '@/services/supabase';
import { canSyncUserToSupabase } from '@/utils/userId';

export default function PrivacyScreen() {
  const router = useRouter();
  const { profile, user, deleteAccountSecure } = useAuthStore();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const payload = {
        exported_at: new Date().toISOString(),
        profile,
        cached_workouts: useAppStore.getState().cachedWorkouts,
        cached_nutrition: useAppStore.getState().cachedNutrition,
        local_progress: useAppStore.getState().localProgress,
        achievements: useAppStore.getState().achievements,
      };
      await Share.share({
        message: JSON.stringify(payload, null, 2),
        title: 'Fit Guide data export',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete account data',
      'This permanently deletes your account and all associated data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await flushSyncOutbox();
              await deleteAccountSecure();
              await outboxService.clear();
              useAppStore.getState().resetUserCache();
              useWorkoutStore.getState().reset();
              router.replace('/(auth)/splash');
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Could not delete account');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center px-5 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-card"
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text">Privacy</Text>
      </View>

      <ScrollView className="flex-1 px-5">
        <Card className="mb-4">
          <Text className="mb-2 text-base font-semibold text-text">Your data</Text>
          <Text className="text-sm leading-5 text-text-secondary">
            Workouts, nutrition, and progress are stored under your user ID when signed in with
            Supabase. Guest sessions on this device use local IDs and stay on-device until you sign
            in.
          </Text>
        </Card>

        <Button
          title={exporting ? 'Preparing…' : 'Export JSON (share)'}
          variant="outline"
          onPress={handleExport}
          fullWidth
          className="mb-4"
          disabled={exporting}
        />

        {isSupabaseConfigured && user && canSyncUserToSupabase(user.id) && (
          <Button
            title={deleting ? 'Deleting…' : 'Delete my data & sign out'}
            variant="danger"
            onPress={handleDelete}
            fullWidth
            className="mb-8"
            disabled={deleting}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
