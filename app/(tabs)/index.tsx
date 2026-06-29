import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { AIRecommendationCard } from '@/components/home/AIRecommendationCard';
import { RecoveryScore } from '@/components/home/RecoveryScore';
import { TodaysWorkoutCard } from '@/components/home/TodaysWorkoutCard';
import { NutritionCard } from '@/components/home/NutritionCard';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { recoveryService } from '@/services/progress';
import { aiCoachService } from '@/services/ai';
import { workoutService } from '@/services/workout';
import { nutritionService } from '@/services/nutrition';
import { getGreeting } from '@/utils/format';
import type { WorkoutPlan } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { streak, waterIntakeMl, achievements } = useAppStore();
  const { currentPlan, setCurrentPlan } = useWorkoutStore();
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const recoveryScore = recoveryService.getOverallRecoveryScore(recovery);

  const recommendations = aiCoachService.generateRecommendations({
    profile: profile!,
    recovery,
    recentWorkouts: [],
    streak,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

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
              value={profile?.weight_kg ?? 0}
              unit="kg"
              icon="scale-outline"
              trend="down"
              trendValue="0.5kg"
            />
            <StatCard
              label="Water"
              value={waterIntakeMl}
              unit="ml"
              icon="water-outline"
              iconColor="#45B7D1"
            />
          </View>
        </View>

        <View className="mb-4 flex-row gap-3">
          <StatCard
            label="Calories"
            value="1,850"
            unit="kcal"
            icon="flame-outline"
            iconColor="#FF5252"
            className="flex-1"
          />
          <StatCard
            label="Body Fat"
            value="18.2"
            unit="%"
            icon="body-outline"
            iconColor="#00D9A5"
            trend="down"
            trendValue="0.3%"
            className="flex-1"
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
                {profile?.workout_days ?? 4} workouts per week
              </Text>
              <Text className="text-sm font-semibold text-primary">2 / {profile?.workout_days ?? 4}</Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-border">
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: `${(2 / (profile?.workout_days ?? 4)) * 100}%` }}
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
