import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, Pressable, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PremiumActionButton } from '@/components/ui/PremiumActionButton';
import { ExerciseDemoPlayer, ExerciseDemoThumbnail } from '@/components/exercise/ExerciseDemoPlayer';
import { useWorkoutStore, getCurrentExerciseSets, getActiveWorkoutElapsedMs } from '@/store/workoutStore';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { workoutService } from '@/services/workout';
import { recoveryService } from '@/services/progress';
import { formatTime } from '@/utils/format';
import { MUSCLE_GROUPS } from '@/constants/app';
import { Colors } from '@/constants/theme';
import type { Exercise, MuscleGroup } from '@/types';

const REST_TIPS = [
  'Slow, deep breaths help clear lactate faster.',
  'Roll your shoulders and loosen your grip.',
  'Picture your next set — form first, weight second.',
  'A quick sip of water keeps performance sharp.',
];

const RING_SIZE = 188;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function PlayerTopBar({
  progress,
  centerTitle,
  centerLabel,
  onLeave,
  onPause,
  isPaused = false,
}: {
  progress: number;
  centerTitle?: string;
  centerLabel: string;
  onLeave: () => void;
  onPause: () => void;
  isPaused?: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 6,
        paddingHorizontal: 20,
        backgroundColor: '#000000',
      }}
    >
      <View className="min-h-[48px] flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onLeave}
          className="h-11 w-11 items-center justify-center rounded-full bg-white/8"
          accessibilityRole="button"
          accessibilityLabel="Back to workout page"
        >
          <Ionicons name="chevron-down" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View className="flex-1 items-center px-2">
          {centerTitle ? (
            <Text className="text-base font-semibold text-white">{centerTitle}</Text>
          ) : null}
          <Text
            className={`text-sm text-text-secondary ${centerTitle ? 'mt-0.5' : ''}`}
            numberOfLines={1}
          >
            {centerLabel}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onPause}
          className="h-11 w-11 items-center justify-center rounded-full bg-white/8"
          accessibilityRole="button"
          accessibilityLabel={isPaused ? 'Resume workout' : 'Pause workout'}
        >
          <Ionicons name={isPaused ? 'play' : 'pause'} size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ProgressBar progress={progress} height={8} color="#0076FC" className="mt-3 mb-2" />
    </View>
  );
}

type RestScreenProps = {
  restTimeRemaining: number;
  restDurationTotal: number;
  workoutProgress: number;
  currentExerciseIndex: number;
  totalExercises: number;
  nextExercise?: Exercise;
  nextExerciseName: string;
  nextSetNumber: number;
  nextSetTotal: number;
  pendingExerciseAdvance: boolean;
  onSkip: () => void;
  onExtend: () => void;
  onPause: () => void;
  onLeave: () => void;
};

function WorkoutPausedOverlay({
  elapsedSeconds,
  onResume,
  onLeave,
  onEnd,
}: {
  elapsedSeconds: number;
  onResume: () => void;
  onLeave: () => void;
  onEnd: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      <View className="w-full max-w-sm items-center">
        <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-[#0076FC]/15">
          <Ionicons name="pause" size={30} color="#4AA3FF" />
        </View>
        <Text className="mb-2 text-2xl font-bold text-white">Workout Paused</Text>
        <Text className="mb-6 text-center text-sm leading-5 text-text-secondary">
          Take your time. Your rest timer and workout clock are on hold until you resume.
        </Text>
        <Text className="mb-8 text-sm font-medium text-[#4AA3FF]">
          Active time · {formatTime(elapsedSeconds)}
        </Text>
        <View className="w-full gap-3 self-stretch">
          <PremiumActionButton title="Resume Workout" icon="play" onPress={onResume} style={{ width: '100%' }} />
          <PremiumActionButton
            title="Back to Workout"
            icon="chevron-down"
            variant="secondary"
            onPress={onLeave}
            style={{ width: '100%' }}
          />
          <PremiumActionButton
            title="End Workout"
            icon="close"
            variant="danger"
            onPress={onEnd}
            style={{ width: '100%' }}
          />
        </View>
      </View>
    </View>
  );
}

function RestScreen({
  restTimeRemaining,
  restDurationTotal,
  workoutProgress,
  currentExerciseIndex,
  totalExercises,
  nextExercise,
  nextExerciseName,
  nextSetNumber,
  nextSetTotal,
  pendingExerciseAdvance,
  onSkip,
  onExtend,
  onPause,
  onLeave,
}: RestScreenProps) {
  const { height: windowHeight } = useWindowDimensions();

  const ringProgress = restDurationTotal > 0 ? restTimeRemaining / restDurationTotal : 0;
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - ringProgress);
  const elapsedRatio =
    restDurationTotal > 0 ? (restDurationTotal - restTimeRemaining) / restDurationTotal : 0;
  const tip = REST_TIPS[Math.min(REST_TIPS.length - 1, Math.floor(elapsedRatio * REST_TIPS.length))];
  const muscle = nextExercise
    ? MUSCLE_GROUPS.find((item) => item.id === nextExercise.primary_muscle)
    : undefined;
  const compactLayout = windowHeight < 760;
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-black" style={{ paddingBottom: insets.bottom }}>
      <PlayerTopBar
        progress={workoutProgress}
        centerTitle="Rest"
        centerLabel={`Exercise ${currentExerciseIndex + 1} of ${totalExercises}`}
        onLeave={onLeave}
        onPause={onPause}
      />

      <View className="flex-1 justify-between px-5" style={{ paddingTop: compactLayout ? 12 : 20, paddingBottom: 8 }}>
        <View className="items-center">
          <View className="items-center justify-center">
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Defs>
                <SvgGradient id="restRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#4AA3FF" />
                  <Stop offset="100%" stopColor="#0076FC" />
                </SvgGradient>
              </Defs>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="url(#restRingGradient)"
                strokeWidth={RING_STROKE}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </Svg>

            <View
              className="absolute items-center justify-center"
              style={{ width: RING_SIZE, height: RING_SIZE }}
            >
              <Text className="text-[56px] font-bold leading-none text-white">
                {formatTime(restTimeRemaining)}
              </Text>
              <Text className="mt-2 text-sm text-text-secondary">remaining</Text>
            </View>
          </View>

          <Text
            className="mt-5 px-2 text-center text-sm leading-5 text-text-secondary"
            numberOfLines={2}
          >
            {tip}
          </Text>
        </View>

        <View className="rounded-[24px] border border-white/6 bg-[#111111] p-4">
          <View className="mb-3 flex-row items-center justify-between gap-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-[#4AA3FF]">
              {pendingExerciseAdvance ? 'Up next' : 'Next set'}
            </Text>
            <Text className="shrink-0 text-xs font-medium text-text-secondary">
              Set {nextSetNumber} of {nextSetTotal}
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            {nextExercise ? (
              <ExerciseDemoThumbnail
                exercise={nextExercise}
                size={compactLayout ? 72 : 84}
                muscleColor={muscle?.color ?? Colors.primary}
              />
            ) : (
              <View
                className="items-center justify-center rounded-2xl bg-white/5"
                style={{ width: compactLayout ? 72 : 84, height: compactLayout ? 72 : 84 }}
              >
                <Ionicons name="barbell-outline" size={28} color={Colors.primaryLight} />
              </View>
            )}

            <View className="min-w-0 flex-1">
              <Text className="text-lg font-bold text-white" numberOfLines={2}>
                {nextExerciseName}
              </Text>
              {muscle && (
                <Text className="mt-1 text-sm text-text-secondary">{muscle.label}</Text>
              )}
            </View>
          </View>
        </View>

        <View className="gap-2">
          <PremiumActionButton title="Continue" icon="play" onPress={onSkip} />
          <Pressable
            onPress={onExtend}
            className="items-center justify-center py-3"
            accessibilityRole="button"
            accessibilityLabel="Add 15 seconds to rest"
          >
            <Text className="text-sm font-semibold text-[#4AA3FF]">Add 15 seconds</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function WorkoutPlayerScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const {
    activeSession,
    currentExerciseIndex,
    currentSetIndex,
    isResting,
    restTimeRemaining,
    restDurationTotal,
    pendingExerciseAdvance,
    completeSet,
    startRest,
    tickRest,
    endRest,
    extendRest,
    finishWorkout,
    isPaused,
    pausedAt,
    totalPausedMs,
    pauseWorkout,
    resumeActiveWorkout,
    syncWorkoutPosition,
  } = useWorkoutStore();
  const { updateStreak, addCachedWorkout } = useAppStore();
  const insets = useSafeAreaInsets();

  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const restInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const exerciseIds = activeSession
    ? [...new Set(activeSession.sets.map((s) => s.exercise_id))]
    : [];
  const totalExercises = exerciseIds.length;
  const completedSets = activeSession?.sets.filter((s) => s.completed).length ?? 0;
  const totalSets = activeSession?.sets.length ?? 1;
  const progress = (completedSets / totalSets) * 100;

  const currentExercise = activeSession
    ? getCurrentExerciseSets(activeSession, currentExerciseIndex)
    : null;
  const currentSet = currentExercise?.sets[currentSetIndex];
  const exercise = currentExercise?.sets[0]?.exercise;

  const nextExerciseId = pendingExerciseAdvance
    ? exerciseIds[currentExerciseIndex + 1]
    : exerciseIds[currentExerciseIndex];
  const nextExerciseName =
    activeSession?.sets.find((s) => s.exercise_id === nextExerciseId)?.exercise?.name ??
    'Next exercise';

  useEffect(() => {
    if (currentSet) {
      setWeight(currentSet.weight_kg ?? 0);
      setReps(currentSet.reps);
    }
  }, [currentSet]);

  useEffect(() => {
    if (isResting && !isPaused) {
      restInterval.current = setInterval(() => tickRest(), 1000);
    } else if (restInterval.current) {
      clearInterval(restInterval.current);
      restInterval.current = null;
    }

    return () => {
      if (restInterval.current) clearInterval(restInterval.current);
    };
  }, [isResting, isPaused, tickRest]);

  useEffect(() => {
    if (!activeSession) return;

    const updateElapsed = () => {
      setElapsedSeconds(
        Math.floor(
          getActiveWorkoutElapsedMs(activeSession, totalPausedMs, isPaused, pausedAt) / 1000
        )
      );
    };

    updateElapsed();

    if (!isPaused) {
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [activeSession, totalPausedMs, isPaused, pausedAt]);

  useEffect(() => {
    if (activeSession) return;

    const timeout = setTimeout(() => {
      if (!useWorkoutStore.getState().activeSession) {
        router.back();
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [activeSession, router]);

  useFocusEffect(
    useCallback(() => {
      syncWorkoutPosition();
    }, [syncWorkoutPosition])
  );

  useEffect(() => {
    if (isResting || !activeSession) return;
    if (!currentExercise || !currentSet) {
      syncWorkoutPosition();
    }
  }, [isResting, activeSession, currentExercise, currentSet, syncWorkoutPosition]);

  if (!activeSession) return null;

  const doFinish = async () => {
    const session = finishWorkout();
    if (session) {
      await workoutService.completeSession(session);
      addCachedWorkout(session);
      updateStreak();

      if (profile) {
        const muscleVolumes = session.sets.reduce<Partial<Record<MuscleGroup, number>>>(
          (acc, set) => {
            const ex = set.exercise;
            if (!ex) return acc;
            const volume = (set.weight_kg ?? 0) * set.reps;
            acc[ex.primary_muscle] = (acc[ex.primary_muscle] ?? 0) + volume;
            return acc;
          },
          {}
        );
        await recoveryService.updateRecoveryAfterWorkout(
          profile.user_id,
          muscleVolumes as Record<MuscleGroup, number>
        );
        await queryClient.invalidateQueries({ queryKey: ['recovery'] });
        await queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      }
    }
    router.back();
  };

  const handleFinish = () => {
    Alert.alert('Finish Workout', 'Are you sure you want to end this workout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Finish', onPress: doFinish },
    ]);
  };

  const handleLeaveWorkout = () => {
    if (!isPaused) {
      pauseWorkout();
    }

    if (router.canDismiss()) {
      router.dismiss();
      return;
    }

    router.replace('/(tabs)/workout');
  };

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pauseWorkout();
  };

  const handleResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resumeActiveWorkout();
  };

  const pausedOverlay = isPaused ? (
    <View
      className="absolute inset-0 z-50 bg-black"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <WorkoutPausedOverlay
        elapsedSeconds={elapsedSeconds}
        onResume={handleResume}
        onLeave={handleLeaveWorkout}
        onEnd={handleFinish}
      />
    </View>
  ) : null;

  if (isResting) {
    const nextSetNumber = pendingExerciseAdvance ? 1 : currentSetIndex + 1;
    const nextSetTotal = pendingExerciseAdvance
      ? getCurrentExerciseSets(activeSession, currentExerciseIndex + 1)?.sets.length ?? 0
      : currentExercise?.sets.length ?? 0;
    const nextExercise = pendingExerciseAdvance
      ? activeSession.sets.find((s) => s.exercise_id === exerciseIds[currentExerciseIndex + 1])?.exercise
      : exercise;

    return (
      <View className="relative flex-1">
        <RestScreen
          restTimeRemaining={restTimeRemaining}
          restDurationTotal={restDurationTotal}
          workoutProgress={progress}
          currentExerciseIndex={currentExerciseIndex}
          totalExercises={totalExercises}
          nextExercise={nextExercise}
          nextExerciseName={nextExerciseName}
          nextSetNumber={nextSetNumber}
          nextSetTotal={nextSetTotal}
          pendingExerciseAdvance={pendingExerciseAdvance}
          onSkip={endRest}
          onPause={handlePause}
          onLeave={handleLeaveWorkout}
          onExtend={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            extendRest(15);
          }}
        />
        {pausedOverlay}
      </View>
    );
  }

  if (!currentExercise || !currentSet) {
    return (
      <View className="relative flex-1 bg-black" style={{ paddingBottom: insets.bottom }}>
        <PlayerTopBar
          progress={progress}
          centerLabel={`Exercise ${currentExerciseIndex + 1} of ${totalExercises}`}
          onLeave={handleLeaveWorkout}
          onPause={isPaused ? handleResume : handlePause}
          isPaused={isPaused}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0076FC" size="large" />
        </View>
        {pausedOverlay}
      </View>
    );
  }

  const handleCompleteSet = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const isLastSet = currentSetIndex >= currentExercise.sets.length - 1;
    const isLastExercise = currentExerciseIndex >= totalExercises - 1;

    if (isLastSet && isLastExercise) {
      completeSet(currentSet.id, reps, weight, false);
      doFinish();
      return;
    }

    completeSet(currentSet.id, reps, weight, !isLastSet);

    const planExercise = useWorkoutStore.getState().currentPlan?.exercises.find(
      (e) => e.exercise_id === currentExercise.exerciseId
    );

    if (!isLastSet) {
      startRest(planExercise?.rest_seconds ?? 90);
    } else {
      startRest(planExercise?.rest_seconds ?? 120, true);
    }
  };

  return (
    <View className="relative flex-1">
    <View className="flex-1 bg-background" style={{ paddingBottom: insets.bottom }}>
      <PlayerTopBar
        progress={progress}
        centerLabel={`Exercise ${currentExerciseIndex + 1} of ${totalExercises}`}
        onLeave={handleLeaveWorkout}
        onPause={isPaused ? handleResume : handlePause}
        isPaused={isPaused}
      />

      <View className="flex-1 px-5">
        <View className="mb-4 overflow-hidden rounded-card">
          {exercise && <ExerciseDemoPlayer exercise={exercise} height={180} />}
        </View>

        <View className="flex-1 items-center justify-center">
        <Text className="mb-2 text-sm uppercase tracking-wider text-primary">
          Set {currentSet.set_number} of {currentExercise.sets.length}
        </Text>
        <Text className="mb-6 text-center text-3xl font-bold text-text">{exercise?.name}</Text>

        <View className="mb-8 w-full flex-row justify-center gap-8">
          <View className="items-center">
            <Text className="mb-2 text-sm text-text-secondary">Weight (kg)</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setWeight(Math.max(0, weight - 2.5))}
                className="h-12 w-12 items-center justify-center rounded-full bg-card"
                accessibilityRole="button"
                accessibilityLabel="Decrease weight"
              >
                <Ionicons name="remove" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text className="mx-6 text-4xl font-bold text-text">{weight}</Text>
              <TouchableOpacity
                onPress={() => setWeight(weight + 2.5)}
                className="h-12 w-12 items-center justify-center rounded-full bg-card"
                accessibilityRole="button"
                accessibilityLabel="Increase weight"
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="items-center">
            <Text className="mb-2 text-sm text-text-secondary">Reps</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setReps(Math.max(0, reps - 1))}
                className="h-12 w-12 items-center justify-center rounded-full bg-card"
                accessibilityRole="button"
                accessibilityLabel="Decrease reps"
              >
                <Ionicons name="remove" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text className="mx-6 text-4xl font-bold text-text">{reps}</Text>
              <TouchableOpacity
                onPress={() => setReps(reps + 1)}
                className="h-12 w-12 items-center justify-center rounded-full bg-card"
                accessibilityRole="button"
                accessibilityLabel="Increase reps"
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Button
          title="Complete Set"
          onPress={handleCompleteSet}
          size="lg"
          fullWidth
          icon={<Ionicons name="checkmark" size={22} color="#FFFFFF" />}
        />
        </View>
      </View>

      {currentExerciseIndex < totalExercises - 1 && (
        <View className="border-t border-border px-5 py-4">
          <Text className="text-xs text-text-muted">Up Next</Text>
          <Text className="text-sm font-medium text-text-secondary">
            {activeSession?.sets.find((s) => s.exercise_id === exerciseIds[currentExerciseIndex + 1])
              ?.exercise?.name ?? 'Next exercise'}
          </Text>
        </View>
      )}
    </View>
    {pausedOverlay}
    </View>
  );
}
