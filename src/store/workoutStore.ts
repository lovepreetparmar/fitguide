import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkoutPlan, WorkoutSession } from '@/types';

interface WorkoutStore {
  currentPlan: WorkoutPlan | null;
  activeSession: WorkoutSession | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  restTimeRemaining: number;
  pendingExerciseAdvance: boolean;
  isPlaying: boolean;

  setCurrentPlan: (plan: WorkoutPlan | null) => void;
  startSession: (session: WorkoutSession) => void;
  completeSet: (
    setId: string,
    reps: number,
    weight: number,
    advance?: boolean,
    rpe?: number | null
  ) => void;
  nextExercise: () => void;
  previousExercise: () => void;
  startRest: (seconds: number, advanceExercise?: boolean) => void;
  tickRest: () => void;
  endRest: () => void;
  finishWorkout: () => WorkoutSession | null;
  clearActiveWorkout: () => void;
  reset: () => void;
}

const initialWorkoutState = {
  currentPlan: null as WorkoutPlan | null,
  activeSession: null as WorkoutSession | null,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  isResting: false,
  restTimeRemaining: 0,
  pendingExerciseAdvance: false,
  isPlaying: false,
};

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      ...initialWorkoutState,

      setCurrentPlan: (plan) => set({ currentPlan: plan }),

      startSession: (session) =>
        set({
          activeSession: session,
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          isPlaying: true,
          isResting: false,
        }),

      completeSet: (setId, reps, weight, advance = true, rpe = null) => {
        const { activeSession, currentSetIndex } = get();
        if (!activeSession) return;

        const updatedSets = activeSession.sets.map((s) =>
          s.id === setId
            ? { ...s, reps, weight_kg: weight, completed: true, rpe: rpe ?? s.rpe }
            : s
        );

        set({
          activeSession: { ...activeSession, sets: updatedSets },
          ...(advance ? { currentSetIndex: currentSetIndex + 1 } : {}),
        });
      },

      nextExercise: () => {
        const { currentExerciseIndex, activeSession } = get();
        if (!activeSession) return;

        const exerciseIds = [...new Set(activeSession.sets.map((s) => s.exercise_id))];
        if (currentExerciseIndex < exerciseIds.length - 1) {
          set({ currentExerciseIndex: currentExerciseIndex + 1, currentSetIndex: 0 });
        }
      },

      previousExercise: () => {
        const { currentExerciseIndex } = get();
        if (currentExerciseIndex > 0) {
          set({ currentExerciseIndex: currentExerciseIndex - 1, currentSetIndex: 0 });
        }
      },

      startRest: (seconds, advanceExercise = false) =>
        set({ isResting: true, restTimeRemaining: seconds, pendingExerciseAdvance: advanceExercise }),

      tickRest: () => {
        const { restTimeRemaining, pendingExerciseAdvance } = get();
        if (restTimeRemaining <= 1) {
          if (pendingExerciseAdvance) {
            get().nextExercise();
          }
          set({ isResting: false, restTimeRemaining: 0, pendingExerciseAdvance: false });
        } else {
          set({ restTimeRemaining: restTimeRemaining - 1 });
        }
      },

      endRest: () => {
        const { pendingExerciseAdvance } = get();
        if (pendingExerciseAdvance) {
          get().nextExercise();
        }
        set({ isResting: false, restTimeRemaining: 0, pendingExerciseAdvance: false });
      },

      finishWorkout: () => {
        const { activeSession } = get();
        if (!activeSession) return null;

        const completedSession: WorkoutSession = {
          ...activeSession,
          completed_at: new Date().toISOString(),
          duration_minutes: Math.round(
            (Date.now() - new Date(activeSession.started_at).getTime()) / 60000
          ),
        };

        return completedSession;
      },

      clearActiveWorkout: () =>
        set({
          activeSession: null,
          currentPlan: null,
          isPlaying: false,
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          isResting: false,
          restTimeRemaining: 0,
          pendingExerciseAdvance: false,
        }),

      reset: () => set({ ...initialWorkoutState }),
    }),
    {
      name: 'fitguide-workout',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentPlan: state.currentPlan,
        activeSession: state.activeSession,
        currentExerciseIndex: state.currentExerciseIndex,
        currentSetIndex: state.currentSetIndex,
        isPlaying: state.isPlaying,
        isResting: state.isResting,
        restTimeRemaining: state.restTimeRemaining,
        pendingExerciseAdvance: state.pendingExerciseAdvance,
      }),
    }
  )
);

export function getCurrentExerciseSets(
  session: WorkoutSession | null,
  exerciseIndex: number
): { exerciseId: string; sets: import('@/types').WorkoutSet[] } | null {
  if (!session) return null;

  const exerciseIds = [...new Set(session.sets.map((s) => s.exercise_id))];
  const exerciseId = exerciseIds[exerciseIndex];
  if (!exerciseId) return null;

  return {
    exerciseId,
    sets: session.sets.filter((s) => s.exercise_id === exerciseId),
  };
}
