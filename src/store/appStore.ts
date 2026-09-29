import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkoutSession, NutritionLog, ProgressEntry, LocalMealLogItem } from '@/types';
import { canSyncUserToSupabase } from '@/utils/userId';

interface AppStore {
  streak: number;
  lastWorkoutDate: string | null;
  waterIntakeMl: number;
  cachedWorkouts: WorkoutSession[];
  cachedNutrition: NutritionLog | null;
  localProgress: ProgressEntry[];
  localMealItems: LocalMealLogItem[];
  favoriteExerciseIds: string[];
  achievements: string[];
  isOffline: boolean;

  updateStreak: (userId?: string) => void;
  setEngagementCache: (streak: number, lastWorkoutDate: string | null) => void;
  addCachedWorkout: (session: WorkoutSession) => void;
  setCachedNutrition: (log: NutritionLog) => void;
  addLocalProgress: (entry: ProgressEntry) => void;
  addLocalMealItem: (item: LocalMealLogItem) => void;
  removeLocalMealItem: (id: string) => void;
  getLocalMealItemsForDate: (userId: string, date: string) => LocalMealLogItem[];
  toggleFavoriteExercise: (exerciseId: string) => void;
  isFavoriteExercise: (exerciseId: string) => boolean;
  addWater: (ml: number) => void;
  unlockAchievement: (id: string, userId?: string) => void;
  setOffline: (offline: boolean) => void;
  resetUserCache: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastWorkoutDate: null,
      waterIntakeMl: 0,
      cachedWorkouts: [],
      cachedNutrition: null,
      localProgress: [],
      localMealItems: [],
      favoriteExerciseIds: [],
      achievements: [],
      isOffline: false,

      setEngagementCache: (streak, lastWorkoutDate) => set({ streak, lastWorkoutDate }),

      updateStreak: (userId?: string) => {
        if (userId && canSyncUserToSupabase(userId)) {
          return;
        }
        const today = new Date().toISOString().split('T')[0];
        const { lastWorkoutDate, streak } = get();

        if (lastWorkoutDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const newStreak = lastWorkoutDate === yesterdayStr ? streak + 1 : 1;
        set({ streak: newStreak, lastWorkoutDate: today });
      },

      addCachedWorkout: (session) =>
        set((state) => ({
          cachedWorkouts: [session, ...state.cachedWorkouts].slice(0, 20),
        })),

      setCachedNutrition: (log) => set({ cachedNutrition: log }),

      addLocalProgress: (entry) =>
        set((state) => ({
          localProgress: [...state.localProgress.filter((p) => p.date !== entry.date), entry].slice(
            -120
          ),
        })),

      addLocalMealItem: (item) =>
        set((state) => ({
          localMealItems: [...state.localMealItems.filter((i) => i.id !== item.id), item].slice(-200),
        })),

      removeLocalMealItem: (id) =>
        set((state) => ({
          localMealItems: state.localMealItems.filter((i) => i.id !== id),
        })),

      getLocalMealItemsForDate: (userId, date) =>
        get().localMealItems.filter((i) => i.user_id === userId && i.date === date),

      toggleFavoriteExercise: (exerciseId) =>
        set((state) => ({
          favoriteExerciseIds: state.favoriteExerciseIds.includes(exerciseId)
            ? state.favoriteExerciseIds.filter((id) => id !== exerciseId)
            : [...state.favoriteExerciseIds, exerciseId],
        })),

      isFavoriteExercise: (exerciseId) => get().favoriteExerciseIds.includes(exerciseId),

      addWater: (ml) => set((state) => ({ waterIntakeMl: state.waterIntakeMl + ml })),

      unlockAchievement: (id) => {
        set((state) => ({
          achievements: state.achievements.includes(id)
            ? state.achievements
            : [...state.achievements, id],
        }));
      },

      setOffline: (offline) => set({ isOffline: offline }),

      resetUserCache: () =>
        set({
          cachedWorkouts: [],
          cachedNutrition: null,
          localProgress: [],
          localMealItems: [],
          streak: 0,
          lastWorkoutDate: null,
          achievements: [],
        }),
    }),
    {
      name: 'fitguide-app',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
