import { create } from 'zustand';
import type { WorkoutPlan, WorkoutSession, WorkoutSet } from '@/types';

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
  completeSet: (setId: string, reps: number, weight: number, advance?: boolean) => void;
  nextExercise: () => void;
  previousExercise: () => void;
  startRest: (seconds: number, advanceExercise?: boolean) => void;
  tickRest: () => void;
  endRest: () => void;
  finishWorkout: () => WorkoutSession | null;
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  currentPlan: null,
  activeSession: null,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  isResting: false,
  restTimeRemaining: 0,
  pendingExerciseAdvance: false,
  isPlaying: false,

  setCurrentPlan: (plan) => set({ currentPlan: plan }),

  startSession: (session) =>
    set({
      activeSession: session,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      isPlaying: true,
      isResting: false,
    }),

  completeSet: (setId, reps, weight, advance = true) => {
    const { activeSession, currentSetIndex } = get();
    if (!activeSession) return;

    const updatedSets = activeSession.sets.map((s) =>
      s.id === setId ? { ...s, reps, weight_kg: weight, completed: true } : s
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

    set({
      activeSession: null,
      currentPlan: null,
      isPlaying: false,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
    });

    return completedSession;
  },

  reset: () =>
    set({
      currentPlan: null,
      activeSession: null,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      isResting: false,
      restTimeRemaining: 0,
      pendingExerciseAdvance: false,
      isPlaying: false,
    }),
}));

export function getCurrentExerciseSets(
  session: WorkoutSession | null,
  exerciseIndex: number
): { exerciseId: string; sets: WorkoutSet[] } | null {
  if (!session) return null;

  const exerciseIds = [...new Set(session.sets.map((s) => s.exercise_id))];
  const exerciseId = exerciseIds[exerciseIndex];
  if (!exerciseId) return null;

  return {
    exerciseId,
    sets: session.sets.filter((s) => s.exercise_id === exerciseId),
  };
}
