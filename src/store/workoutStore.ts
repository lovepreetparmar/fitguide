import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { workoutService } from '@/services/workout';
import { getLocalDateKey, isPlanForToday } from '@/utils/workoutPlan';
import type { WorkoutPlan, WorkoutSession, WorkoutSet } from '@/types';

interface WorkoutStore {
  currentPlan: WorkoutPlan | null;
  planGeneratedOn: string | null;
  activeSession: WorkoutSession | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  restTimeRemaining: number;
  restDurationTotal: number;
  pendingExerciseAdvance: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  pausedAt: number | null;
  totalPausedMs: number;

  setCurrentPlan: (plan: WorkoutPlan | null) => void;
  clearStalePlan: () => void;
  syncDailyPlan: (userId: string | null | undefined) => Promise<void>;
  startSession: (session: WorkoutSession) => boolean;
  completeSet: (setId: string, reps: number, weight: number, advance?: boolean) => void;
  nextExercise: () => void;
  previousExercise: () => void;
  startRest: (seconds: number, advanceExercise?: boolean) => void;
  extendRest: (seconds: number) => void;
  tickRest: () => void;
  endRest: () => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  resumeActiveWorkout: () => boolean;
  syncWorkoutPosition: () => void;
  abandonActiveWorkout: () => void;
  finishWorkout: () => WorkoutSession | null;
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      currentPlan: null,
      planGeneratedOn: null,
      activeSession: null,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      isResting: false,
      restTimeRemaining: 0,
      restDurationTotal: 0,
      pendingExerciseAdvance: false,
      isPlaying: false,
      isPaused: false,
      pausedAt: null,
      totalPausedMs: 0,

      setCurrentPlan: (plan) =>
        set({
          currentPlan: plan,
          planGeneratedOn: plan ? getLocalDateKey() : null,
        }),

      clearStalePlan: () => {
        const { activeSession, currentPlan, planGeneratedOn } = get();
        if (activeSession) return;
        if (currentPlan && !isPlanForToday(planGeneratedOn)) {
          set({ currentPlan: null, planGeneratedOn: null });
        }
      },

      syncDailyPlan: async (userId) => {
        get().clearStalePlan();

        const { activeSession, currentPlan } = get();
        if (activeSession || currentPlan) return;

        if (!userId || userId === 'guest') return;

        const plan = await workoutService.getTodaysPlan(userId);
        if (plan) {
          set({
            currentPlan: plan,
            planGeneratedOn: getLocalDateKey(new Date(plan.created_at)),
          });
        }
      },

      startSession: (session) => {
        if (get().activeSession) return false;

        set({
          activeSession: session,
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          isPlaying: true,
          isResting: false,
          isPaused: false,
          pausedAt: null,
          totalPausedMs: 0,
        });

        return true;
      },

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
        set({
          isResting: true,
          restTimeRemaining: seconds,
          restDurationTotal: seconds,
          pendingExerciseAdvance: advanceExercise,
        }),

      extendRest: (seconds) =>
        set((state) => ({
          restTimeRemaining: state.restTimeRemaining + seconds,
          restDurationTotal: state.restDurationTotal + seconds,
        })),

      tickRest: () => {
        const { restTimeRemaining, pendingExerciseAdvance, isPaused } = get();
        if (isPaused) return;

        if (restTimeRemaining <= 1) {
          if (pendingExerciseAdvance) {
            get().nextExercise();
          }
          set({ isResting: false, restTimeRemaining: 0, restDurationTotal: 0, pendingExerciseAdvance: false });
        } else {
          set({ restTimeRemaining: restTimeRemaining - 1 });
        }
      },

      endRest: () => {
        const { pendingExerciseAdvance } = get();
        if (pendingExerciseAdvance) {
          get().nextExercise();
        }
        set({ isResting: false, restTimeRemaining: 0, restDurationTotal: 0, pendingExerciseAdvance: false });
      },

      pauseWorkout: () => {
        const { isPaused, activeSession } = get();
        if (isPaused || !activeSession) return;

        set({ isPaused: true, isPlaying: false, pausedAt: Date.now() });
      },

      resumeWorkout: () => {
        const { isPaused, pausedAt, totalPausedMs, activeSession } = get();
        if (!isPaused || !activeSession) return;

        set({
          isPaused: false,
          isPlaying: true,
          pausedAt: null,
          totalPausedMs: pausedAt ? totalPausedMs + (Date.now() - pausedAt) : totalPausedMs,
        });
      },

      resumeActiveWorkout: () => {
        const state = get();
        if (!state.activeSession) return false;

        if (state.isPaused) {
          get().resumeWorkout();
        }

        get().syncWorkoutPosition();
        return true;
      },

      syncWorkoutPosition: () => {
        const { activeSession, currentExerciseIndex, currentSetIndex, isResting } = get();
        if (!activeSession || isResting) return;

        const current = getCurrentExerciseSets(activeSession, currentExerciseIndex);
        if (!current) return;

        const currentSet = current.sets[currentSetIndex];
        if (currentSet && !currentSet.completed) return;

        const firstIncomplete = current.sets.findIndex((set) => !set.completed);
        if (firstIncomplete >= 0) {
          set({ currentSetIndex: firstIncomplete });
        }
      },

      abandonActiveWorkout: () =>
        set({
          activeSession: null,
          isPlaying: false,
          isPaused: false,
          pausedAt: null,
          totalPausedMs: 0,
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          isResting: false,
          restTimeRemaining: 0,
          restDurationTotal: 0,
          pendingExerciseAdvance: false,
        }),

      finishWorkout: () => {
        const { activeSession, totalPausedMs, isPaused, pausedAt } = get();
        if (!activeSession) return null;

        const elapsedMs = getActiveWorkoutElapsedMs(
          activeSession,
          totalPausedMs,
          isPaused,
          pausedAt
        );

        const completedSession: WorkoutSession = {
          ...activeSession,
          completed_at: new Date().toISOString(),
          duration_minutes: Math.max(1, Math.round(elapsedMs / 60000)),
        };

        set({
          activeSession: null,
          isPlaying: false,
          isPaused: false,
          pausedAt: null,
          totalPausedMs: 0,
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          isResting: false,
          restTimeRemaining: 0,
          restDurationTotal: 0,
          pendingExerciseAdvance: false,
        });

        return completedSession;
      },

      reset: () =>
        set({
          currentPlan: null,
          planGeneratedOn: null,
          activeSession: null,
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          isResting: false,
          restTimeRemaining: 0,
          restDurationTotal: 0,
          pendingExerciseAdvance: false,
          isPlaying: false,
          isPaused: false,
          pausedAt: null,
          totalPausedMs: 0,
        }),
    }),
    {
      name: 'fitguide-workout-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentPlan: state.currentPlan,
        planGeneratedOn: state.planGeneratedOn,
        activeSession: state.activeSession,
        currentExerciseIndex: state.currentExerciseIndex,
        currentSetIndex: state.currentSetIndex,
        isResting: state.isResting,
        restTimeRemaining: state.restTimeRemaining,
        restDurationTotal: state.restDurationTotal,
        pendingExerciseAdvance: state.pendingExerciseAdvance,
        isPaused: state.isPaused,
        pausedAt: state.pausedAt,
        totalPausedMs: state.totalPausedMs,
        isPlaying: state.isPlaying,
      }),
    }
  )
);

export function getActiveWorkoutElapsedMs(
  session: WorkoutSession,
  totalPausedMs: number,
  isPaused: boolean,
  pausedAt: number | null
) {
  const started = new Date(session.started_at).getTime();
  let paused = totalPausedMs;

  if (isPaused && pausedAt) {
    paused += Date.now() - pausedAt;
  }

  return Math.max(0, Date.now() - started - paused);
}

export function getActiveWorkoutProgressLabel({
  activeSession,
  currentExerciseIndex,
  currentSetIndex,
  isResting,
  pendingExerciseAdvance,
}: {
  activeSession: WorkoutSession | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  pendingExerciseAdvance: boolean;
}) {
  if (!activeSession) return '';

  const current = getCurrentExerciseSets(activeSession, currentExerciseIndex);
  const exerciseName = current?.sets[0]?.exercise?.name ?? activeSession.name;

  if (isResting) {
    if (pendingExerciseAdvance) {
      const exerciseIds = [...new Set(activeSession.sets.map((set) => set.exercise_id))];
      const nextExerciseId = exerciseIds[currentExerciseIndex + 1];
      const nextName =
        activeSession.sets.find((set) => set.exercise_id === nextExerciseId)?.exercise?.name ??
        exerciseName;
      return `Resting · Up next: ${nextName}`;
    }

    return `Resting · ${exerciseName}`;
  }

  const currentSet =
    current?.sets[currentSetIndex] ??
    current?.sets.find((set) => !set.completed) ??
    current?.sets[0];

  if (currentSet && current) {
    return `${exerciseName} · Set ${currentSet.set_number} of ${current.sets.length}`;
  }

  return activeSession.name;
}

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
