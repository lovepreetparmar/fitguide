import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkoutSession, NutritionLog } from '@/types';

interface AppStore {
  streak: number;
  lastWorkoutDate: string | null;
  waterIntakeMl: number;
  cachedWorkouts: WorkoutSession[];
  cachedNutrition: NutritionLog | null;
  achievements: string[];
  isOffline: boolean;

  updateStreak: () => void;
  addCachedWorkout: (session: WorkoutSession) => void;
  setCachedNutrition: (log: NutritionLog) => void;
  addWater: (ml: number) => void;
  unlockAchievement: (id: string) => void;
  clearProgressData: () => void;
  setOffline: (offline: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastWorkoutDate: null,
      waterIntakeMl: 0,
      cachedWorkouts: [],
      cachedNutrition: null,
      achievements: [],
      isOffline: false,

      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastWorkoutDate, streak } = get();

        if (lastWorkoutDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const newStreak = lastWorkoutDate === yesterdayStr ? streak + 1 : 1;
        set({ streak: newStreak, lastWorkoutDate: today });

        if (newStreak === 1) get().unlockAchievement('first_workout');
        if (newStreak >= 10) get().unlockAchievement('ten_workouts');
        if (newStreak >= 30) get().unlockAchievement('thirty_day_streak');
      },

      addCachedWorkout: (session) =>
        set((state) => ({
          cachedWorkouts: [session, ...state.cachedWorkouts].slice(0, 20),
        })),

      setCachedNutrition: (log) => set({ cachedNutrition: log }),

      addWater: (ml) => set((state) => ({ waterIntakeMl: state.waterIntakeMl + ml })),

      unlockAchievement: (id) =>
        set((state) => ({
          achievements: state.achievements.includes(id)
            ? state.achievements
            : [...state.achievements, id],
        })),

      clearProgressData: () =>
        set({
          streak: 0,
          lastWorkoutDate: null,
          cachedWorkouts: [],
          achievements: [],
          waterIntakeMl: 0,
          cachedNutrition: null,
        }),

      setOffline: (offline) => set({ isOffline: offline }),
    }),
    {
      name: 'fitguide-app',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
