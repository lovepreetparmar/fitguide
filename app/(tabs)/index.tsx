import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import { ExerciseDemoThumbnail } from '@/components/exercise/ExerciseDemoPlayer';
import { PremiumActionButton } from '@/components/ui/PremiumActionButton';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { useDailyWorkoutSync } from '@/hooks/useDailyWorkoutSync';
import { useWorkoutStartGuard } from '@/hooks/useWorkoutStartGuard';
import { recoveryService, progressService } from '@/services/progress';
import { workoutService } from '@/services/workout';
import { nutritionService } from '@/services/nutrition';
import { SAMPLE_EXERCISES } from '@/constants/exercises';
import type { Exercise, ProgressEntry } from '@/types';

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

function getGreetingByTime(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning,';
  if (hour < 17) return 'Good Afternoon,';
  return 'Good Evening,';
}

function formatLongDate(date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function buildProgressSeries(progress: ProgressEntry[]) {
  const recent = progress.slice(-7);

  if (recent.length >= 4) {
    return recent.map((entry, index) => ({
      label: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'narrow' }),
      value: entry.workout_volume_kg ?? entry.calories ?? entry.weight_kg ?? 0,
      key: `${entry.date}-${index}`,
    }));
  }

  return [
    { key: 'm', label: 'M', value: 54 },
    { key: 't', label: 'T', value: 62 },
    { key: 'w', label: 'W', value: 58 },
    { key: 'th', label: 'T', value: 76 },
    { key: 'f', label: 'F', value: 71 },
    { key: 's', label: 'S', value: 88 },
    { key: 'su', label: 'S', value: 82 },
  ];
}

function describeWorkout(planName?: string | null) {
  const name = planName?.toLowerCase() ?? '';
  if (name.includes('push')) return 'Chest • Triceps • Shoulders';
  if (name.includes('pull')) return 'Back • Biceps • Rear Delts';
  if (name.includes('leg')) return 'Quads • Hamstrings • Glutes';
  return 'Strength • Hypertrophy • Conditioning';
}

function formatCompactNumber(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${Math.round(value)}`;
}

function getRecoveryStatus(score: number) {
  if (score >= 80) return 'Prime';
  if (score >= 50) return 'Balanced';
  return 'Deload';
}

function PremiumProgressRing({
  score,
  size = 132,
}: {
  score: number;
  size?: number;
}) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#4AA3FF" />
            <Stop offset="100%" stopColor="#0076FC" />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-4xl font-bold text-white">{score}</Text>
        <Text className="mt-1 text-xs font-medium uppercase tracking-[2px] text-[#9E9E9E]">
          {getRecoveryStatus(score)}
        </Text>
      </View>
    </View>
  );
}

function PremiumStatTile({
  label,
  value,
  detail,
  icon,
  large = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  large?: boolean;
}) {
  return (
    <View
      className={`rounded-[28px] border border-white/5 bg-[#111111] ${large ? 'min-h-[152px] p-5' : 'min-h-[132px] p-4'}`}
      style={{
        shadowColor: '#0076FC',
        shadowOpacity: 0.16,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      }}
    >
      <View className="mb-6 h-11 w-11 items-center justify-center rounded-full bg-[#0076FC]/15">
        <Ionicons name={icon} size={20} color="#0076FC" />
      </View>
      <Text className={`${large ? 'text-[30px]' : 'text-2xl'} font-bold text-white`}>{value}</Text>
      <Text className="mt-1 text-sm font-medium text-white">{label}</Text>
      <Text className="mt-2 text-xs leading-5 text-[#9E9E9E]">{detail}</Text>
    </View>
  );
}

type PremiumStatItem = {
  label: string;
  value: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  large?: boolean;
};

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const { streak, achievements } = useAppStore();
  const { currentPlan, setCurrentPlan } = useWorkoutStore();
  useDailyWorkoutSync();
  const { hasActiveWorkout, ensureNoActiveWorkout, ensureCanGenerateWorkout, openActiveWorkout } =
    useWorkoutStartGuard();
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
  const profileWeight = latestProgress?.weight_kg ?? profile?.weight_kg ?? 72;
  const workoutMinutes = currentPlan?.estimated_duration_minutes ?? profile?.workout_time_minutes ?? 45;
  const heroPreviewExercises = useMemo(
    () =>
      currentPlan?.exercises.slice(0, 3).map((item) => ({
        key: item.exercise_id,
        name: item.exercise?.name ?? 'Exercise',
      })) ?? SAMPLE_EXERCISES.slice(0, 3).map((item) => ({ key: item.id, name: item.name })),
    [currentPlan]
  );
  const weightTrend =
    latestProgress?.weight_kg != null && previousProgress?.weight_kg != null
      ? latestProgress.weight_kg - previousProgress.weight_kg
      : null;

  const statTiles: PremiumStatItem[] = [
    {
      label: 'Workout Streak',
      value: `${streak}`,
      detail: 'Days of consistency',
      icon: 'flame',
    },
    {
      label: 'Sleep',
      value: recoveryScore >= 85 ? '8.1h' : '7.3h',
      detail: 'Recovered overnight',
      icon: 'moon',
    },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['recovery'] });
    await queryClient.invalidateQueries({ queryKey: ['nutrition'] });
    await queryClient.invalidateQueries({ queryKey: ['progress'] });
    await queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
    setRefreshing(false);
  }, [queryClient]);

  const runGenerateWorkout = async () => {
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

  const handleGenerateWorkout = () => {
    ensureCanGenerateWorkout(() => {
      void runGenerateWorkout();
    });
  };

  const handleStartWorkout = async () => {
    if (!currentPlan || !profile) return;

    if (hasActiveWorkout) {
      openActiveWorkout();
      return;
    }

    ensureNoActiveWorkout(async () => {
      if (useWorkoutStore.getState().activeSession) return;

      const session = await workoutService.startSession(profile.user_id, currentPlan);
      const started = useWorkoutStore.getState().startSession(session);
      if (!started) return;
      router.push('/workout/player');
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0076FC" />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-2">
          <View className="mb-8 flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-[18px] font-medium text-white/92">{getGreetingByTime()}</Text>
              <Text className="mt-1 text-[40px] font-bold tracking-[-1px] text-white">
                {profile?.name ?? 'Athlete'}
              </Text>
              <Text className="mt-2 text-sm text-[#9E9E9E]">{formatLongDate()}</Text>
            </View>
            <View
              className="rounded-full border border-white/5 bg-[#111111] px-4 py-3"
              style={{
                shadowColor: '#0076FC',
                shadowOpacity: 0.14,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 8 },
              }}
            >
              <View className="flex-row items-center">
                <Ionicons name="flame" size={16} color="#0076FC" />
                <Text className="ml-2 text-sm font-semibold text-white">{streak} day streak</Text>
              </View>
            </View>
          </View>

          <View
            className="mb-8 overflow-hidden rounded-[30px] border border-white/5 bg-[#111111]"
            style={{
              shadowColor: '#0076FC',
              shadowOpacity: 0.2,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 12 },
            }}
          >
            <LinearGradient
              colors={['rgba(74,163,255,0.32)', 'rgba(0,118,252,0.14)', 'rgba(0,0,0,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute inset-0"
            />
            <View className="p-6">
              <View className="mb-6 flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#4AA3FF]">
                    Today's Workout
                  </Text>
                  <Text className="mt-3 text-[32px] font-bold tracking-[-0.8px] text-white">
                    {currentPlan?.name ?? 'Push Day'}
                  </Text>
                  <Text className="mt-2 text-base font-medium text-white/88">
                    {workoutMinutes} min
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-[#9E9E9E]">
                    {describeWorkout(currentPlan?.name)}
                  </Text>
                </View>
                <View className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <Text className="text-xs font-medium text-white/70">
                    {currentPlan?.difficulty ?? 'intermediate'}
                  </Text>
                </View>
              </View>

              <View className="mb-6 flex-row">
                {heroPreviewExercises.map((exercise, index) => (
                  <View
                    key={exercise.key}
                    className={`mr-3 flex-1 rounded-[22px] border border-white/5 bg-black/20 p-3 ${index === 2 ? 'mr-0' : ''}`}
                  >
                    <Text className="text-xs uppercase tracking-[1.5px] text-[#7FAEF8]">
                      {index === 0 ? 'Primary' : index === 1 ? 'Focus' : 'Finisher'}
                    </Text>
                    <Text className="mt-2 text-sm font-medium text-white">{exercise.name}</Text>
                  </View>
                ))}
              </View>

              <PremiumActionButton
                title={
                  hasActiveWorkout
                    ? 'Continue Workout'
                    : currentPlan
                      ? 'Start Workout'
                      : 'Generate Workout'
                }
                onPress={currentPlan ? handleStartWorkout : handleGenerateWorkout}
              />
            </View>
          </View>

          <View className="mb-8">
            <View
              className="overflow-hidden rounded-[30px] border border-white/5 bg-[#111111] p-5"
              style={{
                shadowColor: '#0076FC',
                shadowOpacity: 0.15,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
              }}
            >
              <LinearGradient
                colors={['rgba(0,118,252,0.14)', 'rgba(0,118,252,0.02)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute inset-0"
              />
              <View className="mb-5 flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-semibold text-white">Recovery Overview</Text>
                  <Text className="mt-1 text-sm text-[#9E9E9E]">Readiness for today’s training</Text>
                </View>
                <View className="rounded-full bg-white/5 px-3 py-2">
                  <Text className="text-xs font-medium text-[#7FAEF8]">{workoutsThisWeek}/{weeklyTarget} sessions</Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="mr-5">
                  <PremiumProgressRing score={recoveryScore} />
                </View>
                <View className="flex-1 gap-3">
                  <View className="rounded-[22px] bg-black/20 p-4">
                    <Text className="text-xs uppercase tracking-[1.5px] text-[#7FAEF8]">Weight</Text>
                    <Text className="mt-2 text-2xl font-bold text-white">{profileWeight}<Text className="text-base font-medium text-[#9E9E9E]"> kg</Text></Text>
                    {weightTrend !== null && (
                      <Text className="mt-2 text-xs text-[#9E9E9E]">
                        {weightTrend < 0 ? 'Down' : 'Up'} {Math.abs(weightTrend).toFixed(1)} kg vs last check-in
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="mb-8">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-white">Quick Stats</Text>
              <Text className="text-sm text-[#9E9E9E]">Today at a glance</Text>
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1 gap-4">
                <PremiumStatTile {...statTiles[0]} />
              </View>
              <View className="flex-1 gap-4">
                <PremiumStatTile {...statTiles[1]} />
              </View>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
