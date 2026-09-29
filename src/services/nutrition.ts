import { supabase } from './supabase';
import type { NutritionLog, Profile, WaterLog } from '@/types';
import { canSyncUserToSupabase } from '@/utils/userId';
import { useAppStore } from '@/store/appStore';
import { outboxService } from '@/services/sync/outbox';
import { todayDateString } from '@/utils/nutritionDate';

function emptyLogForDate(userId: string, date: string): NutritionLog {
  return {
    id: `local_${userId}_${date}`,
    user_id: userId,
    date,
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    water_ml: 0,
  };
}

export const nutritionService = {
  async getLogForDate(userId: string, date: string): Promise<NutritionLog | null> {
    const today = todayDateString();
    const cached = useAppStore.getState().cachedNutrition;
    if (date === today && cached && cached.user_id === userId && cached.date === date) {
      if (!canSyncUserToSupabase(userId)) return cached;
    }

    if (!canSyncUserToSupabase(userId)) {
      if (cached?.user_id === userId && cached.date === date) return cached;
      return date === today ? emptyLogForDate(userId, date) : emptyLogForDate(userId, date);
    }

    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      return cached?.user_id === userId && cached.date === date ? cached : null;
    }
    const log = (data as NutritionLog | null) ?? null;
    if (log && date === today) useAppStore.getState().setCachedNutrition(log);
    if (log) return log;
    if (cached?.user_id === userId && cached.date === date) return cached;
    return emptyLogForDate(userId, date);
  },

  async getTodayLog(userId: string): Promise<NutritionLog | null> {
    return this.getLogForDate(userId, todayDateString());
  },

  async logNutritionForDate(
    userId: string,
    date: string,
    log: Partial<NutritionLog>
  ): Promise<NutritionLog> {
    const today = todayDateString();
    const existing =
      useAppStore.getState().cachedNutrition?.user_id === userId &&
      useAppStore.getState().cachedNutrition?.date === date
        ? useAppStore.getState().cachedNutrition!
        : emptyLogForDate(userId, date);

    const merged: NutritionLog = {
      ...existing,
      ...log,
      user_id: userId,
      date,
    };

    if (!canSyncUserToSupabase(userId)) {
      if (date === today) useAppStore.getState().setCachedNutrition(merged);
      return merged;
    }

    const entry = { user_id: userId, date, ...log };

    const { data, error } = await supabase
      .from('nutrition_logs')
      .upsert(entry, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) {
      if (date === today) useAppStore.getState().setCachedNutrition(merged);
      await outboxService.enqueueNutritionLog(userId, entry, date);
      return merged;
    }
    const saved = data as NutritionLog;
    if (date === today) useAppStore.getState().setCachedNutrition(saved);
    return saved;
  },

  async logNutrition(userId: string, log: Partial<NutritionLog>): Promise<NutritionLog> {
    return this.logNutritionForDate(userId, todayDateString(), log);
  },

  async logWater(userId: string, amountMl: number): Promise<WaterLog> {
    const todayLog = await this.getTodayLog(userId);
    const nextWater = (todayLog?.water_ml ?? 0) + amountMl;
    await this.logNutrition(userId, { water_ml: nextWater });

    if (!canSyncUserToSupabase(userId)) {
      return {
        id: `local_water_${Date.now()}`,
        user_id: userId,
        amount_ml: amountMl,
        logged_at: new Date().toISOString(),
      };
    }

    const entry = {
      user_id: userId,
      amount_ml: amountMl,
      logged_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('water_logs').insert(entry).select().single();
    if (error) throw error;
    return data as WaterLog;
  },

  calculateMacros(
    profile: Pick<Profile, 'weight_kg' | 'height_cm' | 'age' | 'gender' | 'goal'> | null,
    activityLevel = 1.55
  ) {
    const weightKg = profile?.weight_kg ?? 75;
    const heightCm = profile?.height_cm ?? 175;
    const age = profile?.age ?? 30;
    const goal = profile?.goal ?? 'general_fitness';
    const isMale = profile?.gender !== 'female';

    const bmr = isMale
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    const tdee = bmr * activityLevel;

    const goalMultipliers: Record<string, number> = {
      lose_weight: 0.85,
      build_muscle: 1.1,
      get_stronger: 1.05,
      improve_endurance: 1.0,
      general_fitness: 1.0,
      athletic_performance: 1.15,
    };

    const calories = Math.round(tdee * (goalMultipliers[goal] ?? 1.0));
    const protein = Math.round(weightKg * 2);
    const fat = Math.round((calories * 0.25) / 9);
    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

    return { calories, protein, carbs, fat, fiber: 30, water: 2500 };
  },

  getMealSuggestions(goal: string, calories: number) {
    const suggestions = [
      {
        name: 'High Protein Breakfast Bowl',
        calories: Math.round(calories * 0.25),
        protein: 35,
        description: 'Greek yogurt, berries, granola, and honey',
      },
      {
        name: 'Grilled Chicken & Rice',
        calories: Math.round(calories * 0.35),
        protein: 45,
        description: 'Lean chicken breast with brown rice and vegetables',
      },
      {
        name: 'Salmon & Sweet Potato',
        calories: Math.round(calories * 0.30),
        protein: 40,
        description: 'Baked salmon with roasted sweet potato and asparagus',
      },
      {
        name: 'Protein Smoothie',
        calories: Math.round(calories * 0.10),
        protein: 30,
        description: 'Whey protein, banana, almond milk, and peanut butter',
      },
    ];

    return suggestions;
  },
};
