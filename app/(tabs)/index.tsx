import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
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
import { nutritionMealsService } from '@/services/nutritionMeals';
import { nutritionQueryKeys } from '@/constants/nutritionQueryKeys';
import { todayDateString } from '@/utils/nutritionDate';
import { engagementService } from '@/services/engagement';
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
  const { streak: cachedStreak, achievements } = useAppStore();
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

  const today = todayDateString();
  const homeUserId = profile?.user_id ?? '';

  const { data: nutrition } = useQuery({
    queryKey: nutritionQueryKeys.log(homeUserId, today),
    queryFn: () => nutritionService.getTodayLog(homeUserId),
    enabled: !!profile,
  });

  const { data: mealItems = [] } = useQuery({
    queryKey: nutritionQueryKeys.mealItems(homeUserId, today),
    queryFn: () => nutritionMealsService.getTodayMealItems(homeUserId),
    enabled: !!profile,
  });

  const nutritionLog = useMemo(() => {
    const userId = profile?.user_id ?? '';
    const today = new Date().toISOString().split('T')[0];
    const empty = {
      id: 'preview',
      user_id: userId,
      date: today,
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      water_ml: 0,
    };
    const base = nutrition ?? empty;
    if (!mealItems.length) return base;
    const totals = mealItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein_g: acc.protein_g + item.protein_g,
        carbs_g: acc.carbs_g + item.carbs_g,
        fat_g: acc.fat_g + item.fat_g,
        fiber_g: acc.fiber_g + item.fiber_g,
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
    );
    return {
      ...base,
      calories: Math.round(totals.calories),
      protein_g: totals.protein_g,
      carbs_g: totals.carbs_g,
      fat_g: totals.fat_g,
      fiber_g: totals.fiber_g,
    };
  }, [nutrition, mealItems, profile?.user_id]);

  const macroTargets = useMemo(
    () => nutritionService.calculateMacros(profile),
    [profile]
  );
  const caloriesRemaining = Math.max(0, macroTargets.calories - nutritionLog.calories);

  const { data: engagement } = useQuery({
    queryKey: ['engagement', profile?.user_id],
    queryFn: async () => {
      const row = await engagementService.fetch(profile?.user_id ?? '');
      if (row) {
        useAppStore.getState().setEngagementCache(row.current_streak, row.last_workout_date);
      }
      return row;
    },
    enabled: !!profile?.user_id,
  });

  const streak = engagement?.current_streak ?? cachedStreak;

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
    await queryClient.invalidateQueries({ queryKey: ['engagement'] });
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
              value={nutritionLog.water_ml}
              unit="ml"
              icon="water-outline"
              iconColor="#45B7D1"
            />
          </View>
        </View>

        <View className="mb-4">
          <StatCard
            label="Calories"
            value={nutritionLog.calories.toLocaleString()}
            unit="kcal"
            icon="flame-outline"
            iconColor="#FF5252"
          />
        </View>

        <View className="mb-4">
          <View className="mb-2 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold text-text">Nutrition</Text>
              <Text className="text-xs text-text-secondary">
                {caloriesRemaining.toLocaleString()} kcal remaining
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/diary')}
              accessibilityRole="button"
              accessibilityLabel="Log nutrition"
            >
              <Text className="text-sm font-semibold text-primary">Log</Text>
            </TouchableOpacity>
          </View>
          <NutritionCard log={nutritionLog} targets={macroTargets} />
        </View>

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
