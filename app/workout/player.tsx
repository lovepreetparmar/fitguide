import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useWorkoutStore, getCurrentExerciseSets } from '@/store/workoutStore';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { workoutService } from '@/services/workout';
import { recoveryService } from '@/services/progress';
import { outboxService } from '@/services/sync/outbox';
import { engagementService } from '@/services/engagement';
import { canSyncUserToSupabase } from '@/utils/userId';
import {
  detectPersonalRecords,
  formatLastPerformance,
  summarizeExerciseHistory,
} from '@/services/progression';
import { formatTime } from '@/utils/format';
import type { MuscleGroup } from '@/types';

const RPE_OPTIONS = [6, 7, 8, 9, 10] as const;

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
    pendingExerciseAdvance,
    completeSet,
    startRest,
    tickRest,
    endRest,
    finishWorkout,
    clearActiveWorkout,
  } = useWorkoutStore();
  const { updateStreak, addCachedWorkout } = useAppStore();

  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [rpe, setRpe] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const userId = profile?.user_id ?? '';
  const restInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentExercise = getCurrentExerciseSets(activeSession, currentExerciseIndex);
  const exercise = currentExercise?.sets[0]?.exercise;
  const currentSet = currentExercise?.sets[currentSetIndex];
  const exerciseIds = activeSession
    ? [...new Set(activeSession.sets.map((s) => s.exercise_id))]
    : [];
  const totalExercises = exerciseIds.length;
  const completedSets = activeSession?.sets.filter((s) => s.completed).length ?? 0;
  const totalSets = activeSession?.sets.length ?? 1;
  const progress = (completedSets / totalSets) * 100;

  const nextExerciseId = pendingExerciseAdvance
    ? exerciseIds[currentExerciseIndex + 1]
    : exerciseIds[currentExerciseIndex];
  const nextExerciseName =
    activeSession?.sets.find((s) => s.exercise_id === nextExerciseId)?.exercise?.name ??
    'Next exercise';

  const { data: exerciseHistory = [] } = useQuery({
    queryKey: ['exercise-history', userId, currentExercise?.exerciseId],
    queryFn: () =>
      workoutService.getExerciseHistory(userId, currentExercise!.exerciseId),
    enabled: Boolean(userId && currentExercise?.exerciseId && canSyncUserToSupabase(userId)),
  });

  const lastPerformance = formatLastPerformance(
    summarizeExerciseHistory(
      exerciseHistory.map((row) => ({
        date: row.date,
        set: row.set,
      }))
    )
  );

  useEffect(() => {
    if (currentSet) {
      setWeight(currentSet.weight_kg ?? 0);
      setReps(currentSet.reps);
      setRpe(currentSet.rpe);
    }
  }, [currentSet]);

  useEffect(() => {
    if (isResting) {
      restInterval.current = setInterval(() => tickRest(), 1000);
    }
    return () => {
      if (restInterval.current) clearInterval(restInterval.current);
    };
  }, [isResting, tickRest]);

  useEffect(() => {
    if (!activeSession) {
      router.back();
    }
  }, [activeSession, router]);

  if (!activeSession || !currentExercise || !currentSet) return null;

  const buildMuscleVolumes = (session: NonNullable<typeof activeSession>) => {
    return session.sets.reduce<Partial<Record<MuscleGroup, number>>>((acc, set) => {
      const ex = set.exercise;
      if (!ex) return acc;
      const volume = (set.weight_kg ?? 0) * set.reps;
      acc[ex.primary_muscle] = (acc[ex.primary_muscle] ?? 0) + volume;
      return acc;
    }, {});
  };

  const loadPriorSummaries = async (
    session: NonNullable<ReturnType<typeof finishWorkout>>,
    syncUserId: string
  ) => {
    const exerciseIds = [...new Set(session.sets.map((s) => s.exercise_id))];
    const pairs = await Promise.all(
      exerciseIds.map(async (id) => {
        const history = await workoutService.getExerciseHistory(syncUserId, id);
        return [
          id,
          summarizeExerciseHistory(
            history.map((row) => ({ date: row.date, set: row.set }))
          ),
        ] as const;
      })
    );
    return new Map(pairs);
  };

  const persistCompletedWorkout = async (session: ReturnType<typeof finishWorkout>) => {
    if (!session) return;

    const userId = profile?.user_id ?? session.user_id;
    const muscleVolumes = buildMuscleVolumes(session);

    addCachedWorkout(session);
    updateStreak(userId);

    if (!canSyncUserToSupabase(userId)) {
      clearActiveWorkout();
      router.back();
      return;
    }

    const priorSummaries = await loadPriorSummaries(session, userId);

    try {
      await workoutService.syncCompletedSession(session, userId);
      if (profile && Object.keys(muscleVolumes).length > 0) {
        await recoveryService.updateRecoveryAfterWorkout(
          profile.user_id,
          muscleVolumes as Record<MuscleGroup, number>
        );
      }
      await queryClient.invalidateQueries({ queryKey: ['recovery'] });
      await queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      await queryClient.invalidateQueries({ queryKey: ['exercise-history'] });
      await engagementService.refreshFromServer(userId);
      await queryClient.invalidateQueries({ queryKey: ['engagement'] });
      await queryClient.invalidateQueries({ queryKey: ['achievements'] });
      showPersonalRecordsIfAny(session, priorSummaries, userId);
      clearActiveWorkout();
      router.back();
    } catch {
      await outboxService.enqueueCompleteWorkout(session, userId, muscleVolumes);
      Alert.alert(
        'Saved on this device',
        "We couldn't reach the server. Your workout is queued and will sync when you're back online.",
        [{ text: 'OK', onPress: () => {
          clearActiveWorkout();
          router.back();
        }}]
      );
    }
  };

  const showPersonalRecordsIfAny = (
    session: NonNullable<ReturnType<typeof finishWorkout>>,
    priorSummaries: Map<string, ReturnType<typeof summarizeExerciseHistory>>,
    syncUserId: string
  ) => {
    const names = new Map<string, string>();
    for (const set of session.sets) {
      if (set.exercise?.name) names.set(set.exercise_id, set.exercise.name);
    }
    const hits = detectPersonalRecords(session.sets, priorSummaries, names);
    if (!hits.length) return;
    useAppStore.getState().unlockAchievement('first_pr');
    const lines = hits
      .slice(0, 3)
      .map((h) =>
        h.type === 'weight'
          ? `${h.exerciseName}: ${h.value} kg (new best weight)`
          : `${h.exerciseName}: ${h.value} kg est. 1RM`
      )
      .join('\n');
    Alert.alert('Personal records', lines);
  };

  const doFinish = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const session = finishWorkout();
      await persistCompletedWorkout(session);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteSet = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const isLastSet = currentSetIndex >= currentExercise.sets.length - 1;
    const isLastExercise = currentExerciseIndex >= totalExercises - 1;

    if (isLastSet && isLastExercise) {
      completeSet(currentSet.id, reps, weight, false, rpe);
      void doFinish();
      return;
    }

    completeSet(currentSet.id, reps, weight, true, rpe);

    const planExercise = useWorkoutStore.getState().currentPlan?.exercises.find(
      (e) => e.exercise_id === currentExercise.exerciseId
    );

    if (!isLastSet) {
      startRest(planExercise?.rest_seconds ?? 90);
    } else {
      startRest(planExercise?.rest_seconds ?? 120, true);
    }
  };

  const handleFinish = () => {
    Alert.alert('Finish Workout', 'Are you sure you want to end this workout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Finish', onPress: () => void doFinish() },
    ]);
  };

  if (isResting) {
    const nextSetNumber = pendingExerciseAdvance ? 1 : currentSetIndex + 1;
    const nextSetTotal = pendingExerciseAdvance
      ? getCurrentExerciseSets(activeSession, currentExerciseIndex + 1)?.sets.length ?? 0
      : currentExercise.sets.length;

    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="mb-2 text-sm uppercase tracking-wider text-text-secondary">Rest</Text>
        <Text className="mb-8 text-7xl font-bold text-primary">{formatTime(restTimeRemaining)}</Text>
        <Text className="mb-2 text-lg text-text">Next: {nextExerciseName}</Text>
        <Text className="mb-8 text-text-secondary">
          Set {nextSetNumber} of {nextSetTotal}
        </Text>
        <Button title="Skip Rest" variant="outline" onPress={endRest} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity onPress={handleFinish} accessibilityRole="button" accessibilityLabel="End workout">
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-sm text-text-secondary">
          Exercise {currentExerciseIndex + 1}/{totalExercises}
        </Text>
        <View className="w-7" />
      </View>

      <ProgressBar progress={progress} height={4} color="#6C63FF" className="px-5" />

      <View className="flex-1 items-center justify-center px-5">
        <Text className="mb-2 text-sm uppercase tracking-wider text-primary">
          Set {currentSet.set_number} of {currentExercise.sets.length}
        </Text>
        <Text className="mb-2 text-center text-3xl font-bold text-text">{exercise?.name}</Text>
        {lastPerformance ? (
          <Text className="mb-6 text-center text-sm text-text-secondary">{lastPerformance}</Text>
        ) : (
          <View className="mb-6" />
        )}

        <View className="mb-6 w-full">
          <Text className="mb-2 text-center text-xs uppercase tracking-wider text-text-muted">
            RPE (optional)
          </Text>
          <View className="flex-row justify-center gap-2">
            {RPE_OPTIONS.map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => setRpe(rpe === value ? null : value)}
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  rpe === value ? 'bg-primary' : 'bg-card'
                }`}
                accessibilityRole="button"
                accessibilityLabel={`RPE ${value}`}
              >
                <Text className={`font-semibold ${rpe === value ? 'text-white' : 'text-text'}`}>
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
          title={isSaving ? 'Saving…' : 'Complete Set'}
          onPress={handleCompleteSet}
          size="lg"
          fullWidth
          disabled={isSaving}
          icon={<Ionicons name="checkmark" size={22} color="#FFFFFF" />}
        />
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
    </SafeAreaView>
  );
}
