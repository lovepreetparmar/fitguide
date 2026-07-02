import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { useWorkoutStore, getActiveWorkoutProgressLabel } from '@/store/workoutStore';
import { PremiumActionButton } from '@/components/ui/PremiumActionButton';
import { workoutService } from '@/services/workout';
import { recoveryService } from '@/services/progress';
import { useQuery } from '@tanstack/react-query';
import { EQUIPMENT_OPTIONS, EXPERIENCE_LEVELS } from '@/constants/app';
import { formatDuration } from '@/utils/format';
import type { Difficulty, Equipment, RecoveryData, WorkoutExercise } from '@/types';
import { useDailyWorkoutSync } from '@/hooks/useDailyWorkoutSync';
import { useWorkoutStartGuard } from '@/hooks/useWorkoutStartGuard';

const COLORS = {
  primary: '#0076FC',
  primaryPressed: '#005ED4',
  lightBlue: '#4AA3FF',
  background: '#000000',
  card: '#111111',
  border: 'rgba(255,255,255,0.05)',
  secondaryText: '#9CA3AF',
  primaryText: '#FFFFFF',
  success: '#7CFFB2',
};

const DURATIONS = [30, 45, 60, 90];
const WORKOUT_TYPES = [
  'Push',
  'Pull',
  'Legs',
  'Upper',
  'Lower',
  'Full Body',
  'Arms',
  'Chest',
  'Back',
  'Shoulders',
  'Custom',
] as const;

export default function WorkoutScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const {
    currentPlan,
    setCurrentPlan,
    activeSession,
    isPaused,
    isResting,
    currentExerciseIndex,
    currentSetIndex,
    pendingExerciseAdvance,
    resumeActiveWorkout,
  } = useWorkoutStore();
  useDailyWorkoutSync();
  const { hasActiveWorkout, ensureNoActiveWorkout, ensureCanGenerateWorkout } = useWorkoutStartGuard();
  const [generating, setGenerating] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(45);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<(typeof WORKOUT_TYPES)[number]>(
    'Full Body'
  );
  const [selectedWorkoutLevel, setSelectedWorkoutLevel] = useState<Difficulty>('intermediate');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const hasRemoteProfile = !!profile && profile.user_id !== 'guest';

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslate = useRef(new Animated.Value(20)).current;
  const previewOpacity = useRef(new Animated.Value(currentPlan ? 1 : 0)).current;
  const previewTranslate = useRef(new Animated.Value(currentPlan ? 0 : 18)).current;
  const ctaPulse = useRef(new Animated.Value(1)).current;
  const glowDrift = useRef(new Animated.Value(0)).current;

  const { data: recovery = [] } = useQuery({
    queryKey: ['recovery', profile?.user_id],
    queryFn: () => recoveryService.getRecoveryData(profile?.user_id ?? ''),
    enabled: hasRemoteProfile,
  });

  useEffect(() => {
    if (profile?.workout_time_minutes && DURATIONS.includes(profile.workout_time_minutes)) {
      setSelectedDuration(profile.workout_time_minutes);
    }
  }, [profile?.workout_time_minutes]);

  useEffect(() => {
    if (profile?.experience) {
      setSelectedWorkoutLevel(profile.experience);
    }
  }, [profile?.experience]);

  useEffect(() => {
    if (profile?.equipment?.length) {
      setSelectedEquipment(profile.equipment);
    }
  }, [profile?.equipment]);

  const toggleEquipment = (equipmentId: Equipment) => {
    setSelectedEquipment((current) => {
      if (current.includes(equipmentId)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== equipmentId);
      }
      return [...current, equipmentId];
    });
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroTranslate, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ctaPulse, {
          toValue: 1.02,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ctaPulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowDrift, {
          toValue: 1,
          duration: 4800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowDrift, {
          toValue: 0,
          duration: 4800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    glowLoop.start();

    return () => {
      pulseLoop.stop();
      glowLoop.stop();
    };
  }, [ctaPulse, glowDrift, heroOpacity, heroTranslate]);

  useEffect(() => {
    if (!currentPlan) {
      previewOpacity.setValue(0);
      previewTranslate.setValue(18);
      return;
    }

    Animated.parallel([
      Animated.timing(previewOpacity, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(previewTranslate, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentPlan, previewOpacity, previewTranslate]);

  const recoveryData = useMemo<RecoveryData[]>(
    () => (recovery.length ? recovery : recoveryService.generateDefaultRecovery()),
    [recovery]
  );
  const recoveryScore = useMemo(
    () => recoveryService.getOverallRecoveryScore(recoveryData),
    [recoveryData]
  );
  const topRecoveredMuscle = useMemo(
    () =>
      [...recoveryData].sort((a, b) => b.score - a.score)[0] ?? {
        muscle_group: 'chest',
        score: 100,
      },
    [recoveryData]
  );

  const previewStats = useMemo(() => {
    if (!currentPlan) return null;
    const totalSets = currentPlan.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const estimatedCalories = Math.round(currentPlan.estimated_duration_minutes * 7.5);
    return {
      totalSets,
      estimatedCalories,
      duration: currentPlan.estimated_duration_minutes,
    };
  }, [currentPlan]);

  const activeWorkoutLabel = useMemo(
    () =>
      getActiveWorkoutProgressLabel({
        activeSession,
        currentExerciseIndex,
        currentSetIndex,
        isResting,
        pendingExerciseAdvance,
      }),
    [activeSession, currentExerciseIndex, currentSetIndex, isResting, pendingExerciseAdvance]
  );

  const handleOpenActiveWorkout = () => {
    if (!resumeActiveWorkout()) return;
    router.navigate('/workout/player');
  };

  const runGenerate = async () => {
    if (!profile) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      const plan = await workoutService.generateWorkout({
        profile,
        recovery: recoveryData,
        workoutLengthMinutes: selectedDuration,
        focus: selectedWorkoutType,
        workoutLevel: selectedWorkoutLevel,
        equipment: selectedEquipment,
      });
      setCurrentPlan(plan);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : 'Failed to generate workout.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = () => {
    ensureCanGenerateWorkout(() => {
      void runGenerate();
    });
  };

  const handleStart = async () => {
    if (!currentPlan || !profile) return;

    ensureNoActiveWorkout(async () => {
      if (useWorkoutStore.getState().activeSession) return;

      const session = await workoutService.startSession(profile.user_id, currentPlan);
      const started = useWorkoutStore.getState().startSession(session);
      if (!started) return;
      router.push('/workout/player');
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.background }} edges={['top', 'bottom']}>
      <View className="flex-1">
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 148 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="pb-6 pt-2">
            <View className="mb-8 flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text
                  className="text-[40px] font-bold tracking-[-1px]"
                  style={{ color: COLORS.primaryText }}
                >
                  Workout
                </Text>
                <Text className="mt-2 text-[15px] leading-6" style={{ color: COLORS.secondaryText }}>
                  Build a personalized training session around your goals and recovery.
                </Text>
              </View>

              <View
                className="rounded-full px-4 py-3"
                style={{
                  backgroundColor: 'rgba(17,17,17,0.92)',
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  shadowColor: COLORS.primary,
                  shadowOpacity: 0.16,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 10 },
                }}
              >
                <Text className="text-[11px] uppercase tracking-[1.8px]" style={{ color: COLORS.secondaryText }}>
                  Recovery
                </Text>
                <Text className="mt-1 text-right text-[24px] font-bold" style={{ color: COLORS.primaryText }}>
                  {recoveryScore}%
                </Text>
              </View>
            </View>

            {activeSession && (
              <Pressable
                onPress={handleOpenActiveWorkout}
                className="mb-8 flex-row items-center rounded-[28px] px-5 py-4"
                style={{
                  backgroundColor: COLORS.card,
                  borderWidth: 1,
                  borderColor: 'rgba(0,118,252,0.26)',
                }}
                accessibilityRole="button"
                accessibilityLabel={isPaused ? 'Resume paused workout' : 'Continue workout in progress'}
              >
                <View
                  className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(0,118,252,0.16)' }}
                >
                  <Ionicons name={isPaused ? 'pause' : 'play'} size={20} color={COLORS.lightBlue} />
                </View>
                <View className="min-w-0 flex-1 pr-3">
                  <Text className="text-[15px] font-semibold" style={{ color: COLORS.primaryText }}>
                    {isPaused ? 'Workout Paused' : 'Workout in Progress'}
                  </Text>
                  <Text className="mt-1 text-sm" style={{ color: COLORS.secondaryText }} numberOfLines={2}>
                    {activeWorkoutLabel}
                  </Text>
                </View>
                <GlassButton
                  title={isPaused ? 'Resume' : 'Continue'}
                  onPress={handleOpenActiveWorkout}
                />
              </Pressable>
            )}

            <SectionTitle title="Workout Length" />
            <View className="mb-8 flex-row flex-wrap gap-3">
              {DURATIONS.map((duration) => (
                <WorkoutTypeChip
                  key={duration}
                  label={`${duration} min`}
                  selected={selectedDuration === duration}
                  onPress={() => setSelectedDuration(duration)}
                />
              ))}
            </View>

            <SectionTitle title="Workout Type" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
              className="mb-8"
            >
              {WORKOUT_TYPES.map((type) => (
                <WorkoutTypeChip
                  key={type}
                  label={type}
                  selected={selectedWorkoutType === type}
                  onPress={() => setSelectedWorkoutType(type)}
                />
              ))}
            </ScrollView>

            <SectionTitle title="Workout Level" />
            <View className="mb-8 flex-row flex-wrap gap-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <WorkoutTypeChip
                  key={level.id}
                  label={level.label}
                  selected={selectedWorkoutLevel === level.id}
                  onPress={() => setSelectedWorkoutLevel(level.id)}
                />
              ))}
            </View>

            <SectionTitle title="Workout Equipment" />
            <View className="mb-8 flex-row flex-wrap gap-3">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <WorkoutTypeChip
                  key={equipment.id}
                  label={equipment.label}
                  selected={selectedEquipment.includes(equipment.id)}
                  onPress={() => toggleEquipment(equipment.id)}
                />
              ))}
            </View>

            <Animated.View
              style={{
                opacity: heroOpacity,
                transform: [{ translateY: heroTranslate }],
              }}
            >
              <View
                className="mb-8 overflow-hidden rounded-[30px]"
                style={{
                  backgroundColor: COLORS.card,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  shadowColor: COLORS.primary,
                  shadowOpacity: 0.22,
                  shadowRadius: 26,
                  shadowOffset: { width: 0, height: 14 },
                }}
              >
                <LinearGradient
                  colors={['rgba(74,163,255,0.26)', 'rgba(0,118,252,0.12)', 'rgba(0,0,0,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="absolute inset-0"
                />
                <Animated.View
                  pointerEvents="none"
                  className="absolute -top-8 h-44 w-44 rounded-full"
                  style={{
                    backgroundColor: 'rgba(0,118,252,0.22)',
                    transform: [
                      {
                        translateX: glowDrift.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-12, 120],
                        }),
                      },
                      {
                        translateY: glowDrift.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 36],
                        }),
                      },
                    ],
                  }}
                />

                <View className="p-6">
                  <Text className="text-sm font-semibold" style={{ color: COLORS.lightBlue }}>
                    Personalized Workout Builder
                  </Text>

                  <View className="mb-6 mt-5 flex-row flex-wrap gap-2">
                    <InfoBadge label={formatDuration(selectedDuration)} />
                    <InfoBadge label={selectedWorkoutType} />
                    <InfoBadge
                      label={
                        EXPERIENCE_LEVELS.find((level) => level.id === selectedWorkoutLevel)?.label ??
                        'Intermediate'
                      }
                    />
                    <InfoBadge label={getEquipmentLabel(selectedEquipment)} />
                  </View>

                  <Animated.View style={{ transform: [{ scale: ctaPulse }] }}>
                    <PremiumActionButton
                      title="Generate Workout"
                      onPress={handleGenerate}
                      loading={generating}
                    />
                  </Animated.View>
                  {generateError ? (
                    <Text className="mt-4 text-sm leading-6" style={{ color: '#FF8A8F' }}>
                      {generateError}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Animated.View>

            <SectionTitle title="Today's Workout" />
            {currentPlan ? (
              <Animated.View
                style={{
                  opacity: previewOpacity,
                  transform: [{ translateY: previewTranslate }],
                }}
              >
                <View
                  className="mb-8 overflow-hidden rounded-[30px] p-5"
                  style={{
                    backgroundColor: COLORS.card,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <LinearGradient
                    colors={['rgba(0,118,252,0.16)', 'rgba(0,0,0,0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="absolute inset-0"
                  />

                  <View className="mb-4 flex-row items-start justify-between">
                    <View className="flex-1 pr-4">
                      <Text className="text-[24px] font-bold tracking-[-0.6px]" style={{ color: COLORS.primaryText }}>
                        {currentPlan.name}
                      </Text>
                      <Text className="mt-2 text-sm leading-6" style={{ color: COLORS.secondaryText }}>
                        Personalized around {selectedWorkoutType.toLowerCase()} focus, current
                        readiness, and your available setup.
                      </Text>
                    </View>
                    <View
                      className="rounded-full px-3 py-2"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <Text className="text-xs font-medium" style={{ color: COLORS.lightBlue }}>
                        {startCase(currentPlan.difficulty)}
                      </Text>
                    </View>
                  </View>

                  <View className="mb-5 flex-row flex-wrap gap-2">
                    <InfoBadge label={`${previewStats?.duration ?? selectedDuration} min`} />
                    <InfoBadge label={`${previewStats?.estimatedCalories ?? 0} cal`} />
                    <InfoBadge label={`${previewStats?.totalSets ?? 0} sets`} />
                    <InfoBadge label={`${currentPlan.exercises.length} exercises`} />
                  </View>

                  <View className="mb-2">
                    {currentPlan.exercises.map((exercise, index) => (
                      <AnimatedExerciseRow
                        key={`${exercise.exercise_id}-${index}`}
                        exercise={exercise}
                        index={index}
                      />
                    ))}
                  </View>

                  <View className="mt-4 flex-row gap-3">
                    <PremiumActionButton
                      title="Regenerate"
                      icon="refresh-outline"
                      variant="secondary"
                      compact
                      style={{ flex: 1 }}
                      onPress={handleGenerate}
                      disabled={generating}
                    />

                    <PremiumActionButton
                      title={hasActiveWorkout ? 'Continue' : 'Start'}
                      compact
                      style={{ flex: 1 }}
                      onPress={hasActiveWorkout ? handleOpenActiveWorkout : handleStart}
                    />
                  </View>
                </View>
              </Animated.View>
            ) : (
              <View
                className="mb-8 items-center rounded-[30px] px-6 py-8"
                style={{
                  backgroundColor: COLORS.card,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <View className="relative mb-5 h-28 w-28 items-center justify-center">
                  <View className="absolute h-28 w-28 rounded-full bg-white/5" />
                  <View
                    className="absolute h-20 w-20 rounded-full"
                    style={{ backgroundColor: 'rgba(0,118,252,0.12)' }}
                  />
                  <View
                    className="h-14 w-14 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'rgba(0,118,252,0.18)' }}
                  >
                    <Ionicons name="barbell" size={26} color={COLORS.lightBlue} />
                  </View>
                </View>
                <Text className="text-lg font-semibold" style={{ color: COLORS.primaryText }}>
                  Your personalized workout will appear here.
                </Text>
                <Text className="mt-2 text-center text-sm leading-6" style={{ color: COLORS.secondaryText }}>
                  Generate a workout plan tailored to your recovery, equipment, duration, and
                  training focus.
                </Text>
              </View>
            )}

          </View>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="mb-4 text-[20px] font-semibold tracking-[-0.3px]" style={{ color: COLORS.primaryText }}>
      {title}
    </Text>
  );
}

function WorkoutTypeChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mr-3 rounded-full px-4 py-3"
      style={{
        backgroundColor: selected ? 'rgba(0,118,252,0.18)' : 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: selected ? 'rgba(74,163,255,0.38)' : COLORS.border,
        shadowColor: selected ? COLORS.primary : 'transparent',
        shadowOpacity: selected ? 0.18 : 0,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      }}
    >
      <Text
        className="text-sm font-medium"
        style={{ color: selected ? COLORS.primaryText : COLORS.secondaryText }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function InfoBadge({ label }: { label: string }) {
  return (
    <View
      className="rounded-full px-3 py-2"
      style={{
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <Text className="text-xs font-medium" style={{ color: COLORS.primaryText }}>
        {label}
      </Text>
    </View>
  );
}

function GlassButton({
  title,
  onPress,
  className,
}: {
  title: string;
  onPress: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={className}
      style={{
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Text className="text-sm font-semibold" style={{ color: COLORS.primaryText }}>
        {title}
      </Text>
    </Pressable>
  );
}

function AnimatedExerciseRow({
  exercise,
  index,
}: {
  exercise: WorkoutExercise;
  index: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 240,
        delay: index * 70,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 280,
        delay: index * 70,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translate]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY: translate }],
      }}
    >
      <View
        className="mb-3 flex-row items-center rounded-[24px] px-4 py-4"
        style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <View
          className="mr-4 h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(0,118,252,0.16)' }}
        >
          <Text className="text-sm font-semibold" style={{ color: COLORS.lightBlue }}>
            {index + 1}
          </Text>
        </View>
        <View className="flex-1 pr-3">
          <Text className="text-[15px] font-semibold" style={{ color: COLORS.primaryText }}>
            {exercise.exercise?.name ?? 'Exercise'}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: COLORS.secondaryText }}>
            {exercise.sets} sets • {exercise.reps} reps • {exercise.rest_seconds}s rest
          </Text>
        </View>
        <Text className="text-xs font-medium" style={{ color: COLORS.lightBlue }}>
          {startCase(exercise.exercise?.primary_muscle ?? 'focus')}
        </Text>
      </View>
    </Animated.View>
  );
}

function startCase(value: string) {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getEquipmentLabel(equipment: Equipment[]) {
  if (!equipment.length) return 'Bodyweight';
  const gymEquipment = ['barbell', 'squat_rack', 'bench', 'cables'];
  const hasGymEquipment = equipment.some((item) => gymEquipment.includes(item));
  if (hasGymEquipment) return 'Gym';
  if (equipment.includes('dumbbells')) return 'Dumbbells';
  if (equipment.includes('bodyweight')) return 'Bodyweight';
  return startCase(equipment[0]);
}
