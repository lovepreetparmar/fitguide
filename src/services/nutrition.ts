import { supabase } from './supabase';
import type { NutritionLog, WaterLog } from '@/types';

export const nutritionService = {
  async getTodayLog(userId: string): Promise<NutritionLog | null> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (error) return null;
    return data as NutritionLog | null;
  },

  async logNutrition(userId: string, log: Partial<NutritionLog>): Promise<NutritionLog> {
    const today = new Date().toISOString().split('T')[0];
    const entry = { user_id: userId, date: today, ...log };

    const { data, error } = await supabase
      .from('nutrition_logs')
      .upsert(entry, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) throw error;
    return data as NutritionLog;
  },

  async logWater(userId: string, amountMl: number): Promise<WaterLog> {
    const entry = {
      user_id: userId,
      amount_ml: amountMl,
      logged_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('water_logs').insert(entry).select().single();
    if (error) throw error;
    return data as WaterLog;
  },

  calculateMacros(weightKg: number, goal: string, activityLevel = 1.55) {
    const bmr = 10 * weightKg + 6.25 * 175 - 5 * 30 + 5;
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
