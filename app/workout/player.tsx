import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useWorkoutStore, getCurrentExerciseSets } from '@/store/workoutStore';
import { useAppStore } from '@/store/appStore';
import { workoutService } from '@/services/workout';
import { formatTime } from '@/utils/format';
import { SAMPLE_EXERCISES } from '@/constants/exercises';

export default function WorkoutPlayerScreen() {
  const router = useRouter();
  const {
    activeSession,
    currentExerciseIndex,
    currentSetIndex,
    isResting,
    restTimeRemaining,
    completeSet,
    nextExercise,
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
  const exercise = SAMPLE_EXERCISES.find((e) => e.id === currentExercise?.exerciseId);
  const currentSet = currentExercise?.sets[currentSetIndex];
  const totalExercises = activeSession
    ? [...new Set(activeSession.sets.map((s) => s.exercise_id))].length
    : 0;
  const completedSets = activeSession?.sets.filter((s) => s.completed).length ?? 0;
  const totalSets = activeSession?.sets.length ?? 1;
  const progress = (completedSets / totalSets) * 100;

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

  const handleCompleteSet = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeSet(currentSet.id, reps, weight);

    const planExercise = useWorkoutStore.getState().currentPlan?.exercises.find(
      (e) => e.exercise_id === currentExercise.exerciseId
    );

    if (currentSetIndex < currentExercise.sets.length - 1) {
      startRest(planExercise?.rest_seconds ?? 90);
    } else if (currentExerciseIndex < totalExercises - 1) {
      startRest(planExercise?.rest_seconds ?? 120);
      setTimeout(() => nextExercise(), 0);
    }
  };

  const handleFinish = () => {
    Alert.alert('Finish Workout', 'Are you sure you want to end this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        onPress: async () => {
          const session = finishWorkout();
          if (session) {
            await workoutService.completeSession(session.id, session.sets);
            addCachedWorkout(session);
            updateStreak();
          }
          router.back();
        },
      },
    ]);
  };

  if (isResting) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="mb-2 text-sm uppercase tracking-wider text-text-secondary">Rest</Text>
        <Text className="mb-8 text-7xl font-bold text-primary">{formatTime(restTimeRemaining)}</Text>
        <Text className="mb-2 text-lg text-text">Next: {exercise?.name}</Text>
        <Text className="mb-8 text-text-secondary">
          Set {currentSetIndex + 2} of {currentExercise.sets.length}
        </Text>
        <Button title="Skip Rest" variant="outline" onPress={endRest} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity onPress={handleFinish}>
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
        <Text className="mb-8 text-center text-3xl font-bold text-text">{exercise?.name}</Text>

        <View className="mb-8 w-full flex-row justify-center gap-8">
          <View className="items-center">
            <Text className="mb-2 text-sm text-text-secondary">Weight (kg)</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setWeight(Math.max(0, weight - 2.5))}
                className="h-12 w-12 items-center justify-center rounded-full bg-card"
              >
                <Ionicons name="remove" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text className="mx-6 text-4xl font-bold text-text">{weight}</Text>
              <TouchableOpacity
                onPress={() => setWeight(weight + 2.5)}
                className="h-12 w-12 items-center justify-center rounded-full bg-card"
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
              >
                <Ionicons name="remove" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text className="mx-6 text-4xl font-bold text-text">{reps}</Text>
              <TouchableOpacity
                onPress={() => setReps(reps + 1)}
                className="h-12 w-12 items-center justify-center rounded-full bg-card"
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

      {currentExerciseIndex < totalExercises - 1 && (
        <View className="border-t border-border px-5 py-4">
          <Text className="text-xs text-text-muted">Up Next</Text>
          <Text className="text-sm font-medium text-text-secondary">
            {SAMPLE_EXERCISES.find(
              (e) =>
                e.id ===
                [...new Set(activeSession.sets.map((s) => s.exercise_id))][currentExerciseIndex + 1]
            )?.name ?? 'Next exercise'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
