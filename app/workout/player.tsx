import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ExerciseDemoPlayer } from '@/components/exercise/ExerciseDemoPlayer';
import { useWorkoutStore, getCurrentExerciseSets } from '@/store/workoutStore';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { workoutService } from '@/services/workout';
import { recoveryService } from '@/services/progress';
import { formatTime } from '@/utils/format';
import type { MuscleGroup } from '@/types';

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
  } = useWorkoutStore();
  const { updateStreak, addCachedWorkout } = useAppStore();

  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
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

  useEffect(() => {
    if (currentSet) {
      setWeight(currentSet.weight_kg ?? 0);
      setReps(currentSet.reps);
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

  const doFinish = async () => {
    const session = finishWorkout();
    if (session) {
      await workoutService.completeSession(session.id, session.sets, session.started_at);
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

  const handleCompleteSet = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const isLastSet = currentSetIndex >= currentExercise.sets.length - 1;
    const isLastExercise = currentExerciseIndex >= totalExercises - 1;

    if (isLastSet && isLastExercise) {
      completeSet(currentSet.id, reps, weight, false);
      doFinish();
      return;
    }

    completeSet(currentSet.id, reps, weight);

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
      { text: 'Finish', onPress: doFinish },
    ]);
  };

  if (isResting) {
    const nextSetNumber = pendingExerciseAdvance ? 1 : currentSetIndex + 1;
    const nextSetTotal = pendingExerciseAdvance
      ? getCurrentExerciseSets(activeSession, currentExerciseIndex + 1)?.sets.length ?? 0
      : currentExercise.sets.length;
    const nextExercise = pendingExerciseAdvance
      ? activeSession.sets.find((s) => s.exercise_id === exerciseIds[currentExerciseIndex + 1])?.exercise
      : exercise;

    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-5">
          <Text className="mb-2 text-sm uppercase tracking-wider text-text-secondary">Rest</Text>
          <Text className="mb-4 text-7xl font-bold text-primary">{formatTime(restTimeRemaining)}</Text>
          {nextExercise && (
            <View className="mb-6 w-full overflow-hidden rounded-card">
              <ExerciseDemoPlayer exercise={nextExercise} height={200} />
            </View>
          )}
          <Text className="mb-2 text-lg text-text">Next: {nextExerciseName}</Text>
          <Text className="mb-8 text-text-secondary">
            Set {nextSetNumber} of {nextSetTotal}
          </Text>
          <Button title="Skip Rest" variant="outline" onPress={endRest} />
        </View>
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
    </SafeAreaView>
  );
}
