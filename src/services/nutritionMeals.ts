import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';
import { nutritionService } from './nutrition';
import { outboxService } from '@/services/sync/outbox';
import { useAppStore } from '@/store/appStore';
import { canSyncUserToSupabase } from '@/utils/userId';
import type {
  Food,
  LocalMealLogItem,
  MealLogItem,
  MealType,
  SavedMeal,
  SavedMealItemTemplate,
} from '@/types';
import { todayDateString } from '@/utils/nutritionDate';
import { addDaysToDateString } from '@/utils/nutritionDate';
import { aggregateLocalFoodShortcuts, type FoodLogShortcut } from './mealFrequency';

const MEAL_TYPES_ALL: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export type MealItemInput = {
  food_id?: string | null;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
};

export function scaleFoodMacros(
  food: Pick<Food, 'calories' | 'protein_g' | 'carbs_g' | 'fat_g' | 'fiber_g' | 'serving_amount'>,
  quantity: number,
  unit: string
) {
  const servings = unit === 'serving' ? quantity : quantity / (food.serving_amount || 1);
  return {
    calories: Math.round(food.calories * servings),
    protein_g: Math.round(food.protein_g * servings * 10) / 10,
    carbs_g: Math.round(food.carbs_g * servings * 10) / 10,
    fat_g: Math.round(food.fat_g * servings * 10) / 10,
    fiber_g: Math.round(food.fiber_g * servings * 10) / 10,
  };
}

function recomputeLocalNutritionTotals(userId: string, date: string) {
  const items = useAppStore.getState().getLocalMealItemsForDate(userId, date);
  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein_g: acc.protein_g + item.protein_g,
      carbs_g: acc.carbs_g + item.carbs_g,
      fat_g: acc.fat_g + item.fat_g,
      fiber_g: acc.fiber_g + item.fiber_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
  );
  const existing = useAppStore.getState().cachedNutrition;
  useAppStore.getState().setCachedNutrition({
    id: existing?.id ?? `local_${userId}_${date}`,
    user_id: userId,
    date,
    calories: Math.round(totals.calories),
    protein_g: totals.protein_g,
    carbs_g: totals.carbs_g,
    fat_g: totals.fat_g,
    fiber_g: totals.fiber_g,
    water_ml: existing?.date === date ? existing.water_ml : 0,
  });
}

function toLocalMealItem(
  userId: string,
  date: string,
  mealType: MealType,
  item: MealItemInput,
  clientItemId: string
): LocalMealLogItem {
  return {
    id: clientItemId,
    meal_log_id: `local_meal_${mealType}`,
    food_id: item.food_id ?? null,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    calories: item.calories,
    protein_g: item.protein_g,
    carbs_g: item.carbs_g,
    fat_g: item.fat_g,
    fiber_g: item.fiber_g,
    client_item_id: clientItemId,
    user_id: userId,
    date,
    meal_type: mealType,
  };
}

function rankFoods(foods: Food[], query: string): Food[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [...foods].sort((a, b) => {
      if (Boolean(a.is_saved) !== Boolean(b.is_saved)) return a.is_saved ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }
  return [...foods].sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aPrefix = aName.startsWith(q) ? 0 : 1;
    const bPrefix = bName.startsWith(q) ? 0 : 1;
    if (aPrefix !== bPrefix) return aPrefix - bPrefix;
    if (Boolean(a.is_saved) !== Boolean(b.is_saved)) return a.is_saved ? -1 : 1;
    return aName.localeCompare(bName);
  });
}

export const nutritionMealsService = {
  async searchFoods(userId: string, query: string): Promise<Food[]> {
    if (!canSyncUserToSupabase(userId)) {
      return [];
    }
    let q = supabase
      .from('foods')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .limit(50);
    if (query.trim()) {
      q = q.ilike('name', `%${query.trim()}%`);
    }
    const { data, error } = await q;
    if (error) return [];
    return rankFoods((data as Food[]) ?? [], query).slice(0, 50);
  },

  async listSavedFoods(userId: string): Promise<Food[]> {
    if (!canSyncUserToSupabase(userId)) return [];
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('user_id', userId)
      .eq('is_saved', true)
      .order('name');
    if (error) return [];
    return (data as Food[]) ?? [];
  },

  async saveFood(userId: string, foodId: string, saved = true): Promise<void> {
    if (!canSyncUserToSupabase(userId)) return;
    await supabase.from('foods').update({ is_saved: saved }).eq('id', foodId).eq('user_id', userId);
  },

  async createCustomFood(
    userId: string,
    food: Omit<Food, 'id' | 'user_id' | 'created_at'> & { is_saved?: boolean }
  ): Promise<Food> {
    if (!canSyncUserToSupabase(userId)) {
      throw new Error('Sign in to save custom foods.');
    }
    const { data, error } = await supabase
      .from('foods')
      .insert({ ...food, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data as Food;
  },

  async listSavedMeals(userId: string): Promise<SavedMeal[]> {
    if (!canSyncUserToSupabase(userId)) return [];
    const { data, error } = await supabase
      .from('saved_meals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data as SavedMeal[]) ?? [];
  },

  async createSavedMeal(
    userId: string,
    name: string,
    items: SavedMealItemTemplate[]
  ): Promise<SavedMeal> {
    if (!canSyncUserToSupabase(userId)) {
      throw new Error('Sign in to save meals.');
    }
    const { data, error } = await supabase
      .from('saved_meals')
      .insert({ user_id: userId, name, items })
      .select()
      .single();
    if (error) throw error;
    return data as SavedMeal;
  },

  async applySavedMeal(
    userId: string,
    savedMeal: SavedMeal,
    mealType: MealType,
    date = todayDateString()
  ): Promise<void> {
    for (const template of savedMeal.items) {
      await this.addMealItem(userId, mealType, template, date);
    }
  },

  async getMealItemsForDate(userId: string, date: string): Promise<MealLogItem[]> {
    return this.getTodayMealItems(userId, date);
  },

  async getTodayMealItems(userId: string, date = todayDateString()): Promise<MealLogItem[]> {
    const local = useAppStore
      .getState()
      .getLocalMealItemsForDate(userId, date)
      .map((i) => ({ ...i }));

    if (!canSyncUserToSupabase(userId)) {
      return local;
    }

    const { data: meals, error: mealError } = await supabase
      .from('meal_logs')
      .select('id, meal_type')
      .eq('user_id', userId)
      .eq('date', date);
    if (mealError || !meals?.length) {
      return local;
    }

    const mealIds = meals.map((m) => m.id);
    const { data: items, error } = await supabase
      .from('meal_log_items')
      .select('*')
      .in('meal_log_id', mealIds)
      .order('created_at', { ascending: true });
    if (error) return local;

    const typeByMeal = new Map(meals.map((m) => [m.id, m.meal_type as MealType]));
    const remote = (items as MealLogItem[]).map((item) => ({
      ...item,
      meal_type: typeByMeal.get(item.meal_log_id),
    }));

    const remoteClientIds = new Set(remote.map((r) => r.client_item_id).filter(Boolean));
    const pendingLocal = local.filter((l) => !remoteClientIds.has(l.client_item_id ?? l.id));
    return [...remote, ...pendingLocal];
  },

  async ensureMealLog(userId: string, mealType: MealType, date = todayDateString()) {
    const { data, error } = await supabase
      .from('meal_logs')
      .upsert({ user_id: userId, date, meal_type: mealType }, { onConflict: 'user_id,date,meal_type' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async syncMealItemFromOutbox(
    userId: string,
    mealType: MealType,
    item: MealItemInput,
    date: string,
    clientItemId: string
  ): Promise<MealLogItem> {
    const meal = await this.ensureMealLog(userId, mealType, date);

    const { data, error } = await supabase
      .from('meal_log_items')
      .insert({
        meal_log_id: meal.id,
        food_id: item.food_id ?? null,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g,
        fiber_g: item.fiber_g,
        client_item_id: clientItemId,
      })
      .select()
      .single();

    if (error?.code === '23505') {
      const { data: existing } = await supabase
        .from('meal_log_items')
        .select('*')
        .eq('client_item_id', clientItemId)
        .maybeSingle();
      if (existing) {
        return { ...(existing as MealLogItem), meal_type: mealType };
      }
    }
    if (error) throw error;

    await supabase.rpc('recompute_nutrition_log_for_date', { p_user_id: userId, p_date: date });
    useAppStore.getState().removeLocalMealItem(clientItemId);
    await nutritionService.getLogForDate(userId, date);
    return { ...(data as MealLogItem), meal_type: mealType };
  },

  mealItemsToTemplates(items: MealLogItem[]): SavedMealItemTemplate[] {
    return items.map((item) => ({
      name: item.name,
      food_id: item.food_id,
      quantity: item.quantity,
      unit: item.unit,
      calories: item.calories,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
      fiber_g: item.fiber_g,
    }));
  },

  async addMealItem(
    userId: string,
    mealType: MealType,
    item: MealItemInput,
    date = todayDateString()
  ): Promise<MealLogItem> {
    const clientItemId = `local_item_${Crypto.randomUUID()}`;

    if (!canSyncUserToSupabase(userId)) {
      const local = toLocalMealItem(userId, date, mealType, item, clientItemId);
      useAppStore.getState().addLocalMealItem(local);
      recomputeLocalNutritionTotals(userId, date);
      return local;
    }

    try {
      return await this.syncMealItemFromOutbox(userId, mealType, item, date, clientItemId);
    } catch {
      const local = toLocalMealItem(userId, date, mealType, item, clientItemId);
      useAppStore.getState().addLocalMealItem(local);
      recomputeLocalNutritionTotals(userId, date);
      await outboxService.enqueueMealItemAdded(userId, {
        date,
        mealType,
        client_item_id: clientItemId,
        item,
      });
      return local;
    }
  },

  async deleteMealItem(userId: string, itemId: string, date = todayDateString()): Promise<void> {
    if (itemId.startsWith('local_item_')) {
      useAppStore.getState().removeLocalMealItem(itemId);
      recomputeLocalNutritionTotals(userId, date);
      return;
    }

    if (!canSyncUserToSupabase(userId)) return;
    const { error } = await supabase.from('meal_log_items').delete().eq('id', itemId);
    if (error) throw error;
    await supabase.rpc('recompute_nutrition_log_for_date', { p_user_id: userId, p_date: date });
    await nutritionService.getLogForDate(userId, date);
  },

  async addQuickCalories(
    userId: string,
    date: string,
    mealType: MealType,
    input: { name?: string; calories: number; protein_g?: number; carbs_g?: number; fat_g?: number }
  ): Promise<MealLogItem> {
    const protein = input.protein_g ?? 0;
    const remainingCal = Math.max(0, input.calories - protein * 4);
    const carbs = input.carbs_g ?? Math.round(remainingCal * 0.5 / 4);
    const fat = input.fat_g ?? Math.round((remainingCal - carbs * 4) / 9);
    return this.addMealItem(userId, mealType, {
      name: input.name?.trim() || 'Quick add',
      quantity: 1,
      unit: 'serving',
      calories: Math.round(input.calories),
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      fiber_g: 0,
    }, date);
  },

  async copyMealToDate(
    userId: string,
    fromDate: string,
    fromMealType: MealType,
    toDate: string,
    toMealType: MealType
  ): Promise<number> {
    const items = (await this.getMealItemsForDate(userId, fromDate)).filter(
      (i) => i.meal_type === fromMealType
    );
    for (const item of items) {
      await this.addMealItem(
        userId,
        toMealType,
        {
          food_id: item.food_id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein_g: item.protein_g,
          carbs_g: item.carbs_g,
          fat_g: item.fat_g,
          fiber_g: item.fiber_g,
        },
        toDate
      );
    }
    return items.length;
  },

  async copyDay(userId: string, fromDate: string, toDate: string): Promise<number> {
    let copied = 0;
    for (const mealType of MEAL_TYPES_ALL) {
      copied += await this.copyMealToDate(userId, fromDate, mealType, toDate, mealType);
    }
    return copied;
  },

  async copyMealFromYesterday(
    userId: string,
    mealType: MealType,
    toDate: string = todayDateString()
  ): Promise<number> {
    const fromDate = addDaysToDateString(toDate, -1);
    return this.copyMealToDate(userId, fromDate, mealType, toDate, mealType);
  },

  async getRecentFoods(userId: string, limit = 12): Promise<FoodLogShortcut[]> {
    const local = aggregateLocalFoodShortcuts(
      useAppStore.getState().localMealItems,
      userId,
      'recent',
      limit
    );
    if (!canSyncUserToSupabase(userId)) return local;

    const { data, error } = await supabase.rpc('get_recent_food_logs', {
      p_user_id: userId,
      p_limit: limit,
    });
    if (error || !data?.length) return local;

    const remote = (data as FoodLogShortcut[]).map((row) => ({
      food_id: row.food_id,
      name: row.name,
      quantity: Number(row.quantity),
      unit: row.unit,
      calories: Number(row.calories),
      protein_g: Number(row.protein_g),
      carbs_g: Number(row.carbs_g),
      fat_g: Number(row.fat_g),
      fiber_g: Number(row.fiber_g),
    }));

    const seen = new Set(remote.map((r) => r.food_id ?? r.name.toLowerCase()));
    const merged: FoodLogShortcut[] = [...remote];
    for (const item of local) {
      const key = item.food_id ?? item.name.toLowerCase();
      if (!seen.has(key)) merged.push(item);
    }
    return merged.slice(0, limit);
  },

  async getFrequentFoods(userId: string, limit = 12): Promise<FoodLogShortcut[]> {
    const local = aggregateLocalFoodShortcuts(
      useAppStore.getState().localMealItems,
      userId,
      'frequent',
      limit
    );
    if (!canSyncUserToSupabase(userId)) return local;

    const { data, error } = await supabase.rpc('get_frequent_food_logs', {
      p_user_id: userId,
      p_limit: limit,
    });
    if (error || !data?.length) return local;

    return (data as FoodLogShortcut[]).map((row) => ({
      food_id: row.food_id,
      name: row.name,
      quantity: Number(row.quantity),
      unit: row.unit,
      calories: Number(row.calories),
      protein_g: Number(row.protein_g),
      carbs_g: Number(row.carbs_g),
      fat_g: Number(row.fat_g),
      fiber_g: Number(row.fiber_g),
      log_count: row.log_count,
    }));
  },

  async logFoodShortcut(
    userId: string,
    date: string,
    mealType: MealType,
    shortcut: FoodLogShortcut
  ): Promise<MealLogItem> {
    const { last_logged_at: _a, log_count: _b, ...item } = shortcut;
    return this.addMealItem(
      userId,
      mealType,
      { ...item, food_id: item.food_id ?? null },
      date
    );
  },
};
