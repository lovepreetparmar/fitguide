import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useWorkoutStore } from '@/store/workoutStore';

export function useDailyWorkoutSync() {
  const profile = useAuthStore((state) => state.profile);
  const syncDailyPlan = useWorkoutStore((state) => state.syncDailyPlan);

  useFocusEffect(
    useCallback(() => {
      void syncDailyPlan(profile?.user_id);
    }, [profile?.user_id, syncDailyPlan])
  );
}
