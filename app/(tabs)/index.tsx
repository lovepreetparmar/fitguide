import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { AIRecommendationCard } from '@/components/home/AIRecommendationCard';
import { RecoveryScore } from '@/components/home/RecoveryScore';
import { TodaysWorkoutCard } from '@/components/home/TodaysWorkoutCard';
import { NutritionCard } from '@/components/home/NutritionCard';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { recoveryService, progressService } from '@/services/progress';
import { aiCoachService } from '@/services/ai';
import { workoutService } from '@/services/workout';
import { nutritionService } from '@/services/nutrition';
import { getGreeting } from '@/utils/format';

function getWorkoutsThisWeek(sessions: { completed_at: string | null }[]): number {
  const now = new Date();
  const day = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  return sessions.filter(
    (s) => s.completed_at && new Date(s.completed_at) >= startOfWeek
  ).length;
}

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const { streak, achievements } = useAppStore();
  const { currentPlan, setCurrentPlan } = useWorkoutStore();
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: recentSessions = [] } = useQuery({
    queryKey: ['workout-sessions', profile?.user_id],
    queryFn: () => workoutService.getRecentSessions(profile?.user_id ?? ''),
    enabled: !!profile,
  });

  const { data: recovery = [] } = useQuery({
    queryKey: ['recovery', profile?.user_id],
    queryFn: () => recoveryService.getRecoveryData(profile?.user_id ?? ''),
    enabled: !!profile,
  });

  const { data: nutrition } = useQuery({
    queryKey: ['nutrition', profile?.user_id],
    queryFn: () => nutritionService.getTodayLog(profile?.user_id ?? ''),
    enabled: !!profile,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress', profile?.user_id, 'month'],
    queryFn: () => progressService.getProgress(profile?.user_id ?? '', 'month'),
    enabled: !!profile,
  });

  const recoveryScore = recoveryService.getOverallRecoveryScore(recovery);
  const latestProgress = progress[progress.length - 1];
  const previousProgress = progress[progress.length - 2];
  const workoutsThisWeek = useMemo(() => getWorkoutsThisWeek(recentSessions), [recentSessions]);
  const weeklyTarget = profile?.workout_days ?? 4;
  const weeklyProgress = Math.min(100, (workoutsThisWeek / weeklyTarget) * 100);

  const weightTrend =
    latestProgress?.weight_kg != null && previousProgress?.weight_kg != null
      ? latestProgress.weight_kg - previousProgress.weight_kg
      : null;

  const recommendations = useMemo(
    () =>
      aiCoachService.generateRecommendations({
        profile,
        recovery,
        recentWorkouts: recentSessions,
        streak,
      }),
    [profile, recovery, recentSessions, streak]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['recovery'] });
    await queryClient.invalidateQueries({ queryKey: ['nutrition'] });
    await queryClient.invalidateQueries({ queryKey: ['progress'] });
    await queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
    setRefreshing(false);
  }, [queryClient]);

  const handleGenerateWorkout = async () => {
    if (!profile) return;
    setGenerating(true);
    try {
      const plan = await workoutService.generateWorkout({
        profile,
        recovery,
        workoutLengthMinutes: profile.workout_time_minutes ?? 60,
      });
      setCurrentPlan(plan);
    } finally {
      setGenerating(false);
    }
  };

  const handleStartWorkout = async () => {
    if (!currentPlan || !profile) return;
    const session = await workoutService.startSession(profile.user_id, currentPlan);
    useWorkoutStore.getState().startSession(session);
    router.push('/workout/player');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center justify-between pt-2">
          <View>
            <Text className="text-sm text-text-secondary">{getGreeting()}</Text>
            <Text className="text-2xl font-bold text-text">{profile?.name ?? 'Athlete'}</Text>
          </View>
          <View className="flex-row items-center rounded-full bg-card px-3 py-2">
            <Ionicons name="flame" size={18} color="#FF5252" />
            <Text className="ml-1 text-sm font-bold text-text">{streak}</Text>
          </View>
        </View>

        <AIRecommendationCard recommendations={recommendations} />

        <TodaysWorkoutCard
          plan={currentPlan}
          onStart={handleStartWorkout}
          onGenerate={handleGenerateWorkout}
          loading={generating}
        />

        <View className="mb-4 flex-row gap-3">
          <View className="flex-1">
            <RecoveryScore score={recoveryScore} size={100} />
          </View>
          <View className="flex-1 justify-between gap-3">
            <StatCard
              label="Weight"
              value={latestProgress?.weight_kg ?? profile?.weight_kg ?? 0}
              unit="kg"
              icon="scale-outline"
              trend={
                weightTrend === null
                  ? undefined
                  : weightTrend < 0
                    ? 'down'
                    : weightTrend > 0
                      ? 'up'
                      : undefined
              }
              trendValue={
                weightTrend !== null
                  ? `${Math.abs(weightTrend).toFixed(1)}kg`
                  : undefined
              }
            />
            <StatCard
              label="Water"
              value={nutrition?.water_ml ?? 0}
              unit="ml"
              icon="water-outline"
              iconColor="#45B7D1"
            />
          </View>
        </View>

        <View className="mb-4">
          <StatCard
            label="Calories"
            value={nutrition?.calories?.toLocaleString() ?? '0'}
            unit="kcal"
            icon="flame-outline"
            iconColor="#FF5252"
          />
        </View>

        {nutrition && (
          <View className="mb-4">
            <NutritionCard
              log={nutrition}
              targets={nutritionService.calculateMacros(
                profile?.weight_kg ?? 75,
                profile?.goal ?? 'general_fitness'
              )}
            />
          </View>
        )}

        <View className="mb-4">
          <Text className="mb-3 text-lg font-semibold text-text">Weekly Goal</Text>
          <View className="rounded-card bg-card p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm text-text-secondary">
                {weeklyTarget} workouts per week
              </Text>
              <Text className="text-sm font-semibold text-primary">
                {workoutsThisWeek} / {weeklyTarget}
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-border">
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: `${weeklyProgress}%` }}
              />
            </View>
          </View>
        </View>

        {achievements.length > 0 && (
          <View className="mb-4">
            <Text className="mb-3 text-lg font-semibold text-text">Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {achievements.map((id) => (
                <View key={id} className="mr-3 items-center rounded-card bg-card px-4 py-3">
                  <Ionicons name="trophy" size={28} color="#FFC107" />
                  <Text className="mt-2 text-xs text-text-secondary">{id.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <Button
          title="Quick Start"
          onPress={handleGenerateWorkout}
          loading={generating}
          fullWidth
          size="lg"
          icon={<Ionicons name="flash" size={20} color="#FFFFFF" />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
