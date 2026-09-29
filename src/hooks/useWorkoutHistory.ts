import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workoutService } from '@/services/workout';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import {
  buildPersonalRecords,
  filterSessionsByPeriod,
  getAverageDurationMinutes,
  getTotalCaloriesBurned,
  getTotalVolumeKg,
  getTrainingDays,
  getWeeklyActivity,
  getWorkoutsThisWeek,
  mergeWorkoutSessions,
  type HistoryPeriod,
} from '@/utils/workoutHistory';

export function useWorkoutHistory(period: HistoryPeriod) {
  const { profile } = useAuthStore();
  const cachedWorkouts = useAppStore((state) => state.cachedWorkouts);

  const { data: remoteSessions = [], isLoading } = useQuery({
    queryKey: ['workout-sessions', profile?.user_id],
    queryFn: () => workoutService.getRecentSessions(profile?.user_id ?? '', 40),
    enabled: !!profile,
  });

  const allSessions = useMemo(
    () => mergeWorkoutSessions(remoteSessions, cachedWorkouts),
    [remoteSessions, cachedWorkouts]
  );

  const periodSessions = useMemo(
    () => filterSessionsByPeriod(allSessions, period),
    [allSessions, period]
  );

  const stats = useMemo(() => {
    const workoutsThisWeek = getWorkoutsThisWeek(allSessions);

    return {
      totalWorkouts: periodSessions.length,
      weeklyVolumeKg: getTotalVolumeKg(periodSessions),
      caloriesBurned: getTotalCaloriesBurned(periodSessions),
      averageDuration: getAverageDurationMinutes(periodSessions),
      trainingDays: getTrainingDays(periodSessions),
      weeklyActivity: getWeeklyActivity(allSessions),
      personalRecords: buildPersonalRecords(allSessions),
      workoutsThisWeek,
    };
  }, [allSessions, periodSessions]);

  return {
    isLoading,
    allSessions,
    periodSessions,
    ...stats,
  };
}
